from tasks import *

from quant.multi_match.dixon_coles import *

import quant.multi_match.products as products

Products=yaml.load(file("config/multi_match_products.yaml").read())

Selections = HomeWin, AwayWin = "home_win", "away_win"

Strikes=[0.5, 1.5, 2.5]

DefaultPrice=1000

ProductRangeMapping=yaml.load("""
winners: selections
losers: selections
draws: scalar
btts: scalar
overs: strikes
unders: strikes
scored: selections_strikes
conceded: selections_strikes
winners_overs: selections_strikes
winners_btts: selections
overs_btts: strikes
""")

Seed, Paths = 13, 5000

QueueName="quant"

# curl "http://localhost:8080/tasks/fixtures?leagues=ENG.1&window=14"

class IndexHandler(webapp2.RequestHandler):

    @task
    def get(self):         
        leaguenames=[leaguename 
                     for leaguename in self.request.get("leagues").split(",")
                     if leaguename in Leagues.keys()]
        if leaguenames==[]:
            leaguenames=Leagues.keys()
        window=self.request.get("window")
        [taskqueue.add(url="/tasks/fixtures/league",
                       params={"league": leaguename,
                               "window": window},
                       queue_name=QueueName)
         for leaguename in leaguenames]
        logging.info("%s league tasks added" % len(leaguenames))

"""
- NB not spawning one task per DC calculation because
  - DC calculation is relatively fast
  - finite number of fixtures per league assuming window is < 30 days
- should really do rho calculation but O/U 2.5 prices not currently available via Elisey API
"""

class LeagueHandler(webapp2.RequestHandler):

    def filter_best_1x2_prices(self, prices):
        best={}
        for price in prices:
            for attr in ["1", "x", "2"]:
                best.setdefault(attr, 1.0)
                value=price["price_%s" % attr]
                if value > best[attr]:
                    best[attr]=value
        return [best[attr]
                for attr in ["1", "x", "2"]]

    def normalise_1x2_prices(self, prices):
        probs=[1/float(price)
               for price in prices]
        overround=sum(probs)
        normprobs=[prob/float(overround)
                   for prob in probs]
        return [1/float(prob)
                for prob in normprobs]

    def filterfn(self, fixture, cutoff):
        return ("kickoff" in fixture and
                fixture["kickoff"] not in [[], None] and
                fixture["kickoff"].date() <= cutoff and
                "pre_event_1x2_prices" in fixture and
                fixture["pre_event_1x2_prices"] not in [[], None])
    
    def calc_dc_grid(self, fixture):
        probs=[1/float(price)
               for price in fixture["1x2_prices"]]
        from quant.multi_match.dixon_coles import CSGrid
        lx, ly, err = CSGrid.solve(probs)
        formatstr="%s/%s :: lx -> %.5f, ly -> %.5f, err -> %.5f"
        logging.info(formatstr % (fixture["league"],
                                  fixture["name"],
                                  lx, ly, err))
        fixture["dc_grid"]=CSGrid.from_poisson(lx, ly)

    def calc_price(self, samples, type, selection=None, strike=None):
        product=getattr(products, Products[type])({"n_goals": strike})
        def init_leg(attr=None):
            leg={}
            leg["match"]="A vs B"
            if attr!=None:
                leg["selection"]="A" if attr==HomeWin else "B"
            return leg
        leg=init_leg(selection)
        prob=sum([int(product.sim_payoff(leg, q))
                  for q in samples])/float(Paths)
        if prob==0:
            return DefaultPrice
        return 1/float(prob)

    def calc_price_scalar(self, samples, productname):
        return self.calc_price(samples,
                               productname,
                               selection=None,
                               strike=None)

    def calc_price_selections(self, samples, productname):
        return dict([(selection, self.calc_price(samples,
                                                 productname,
                                                 selection=selection,
                                                 strike=0.5))
                     for selection in Selections])

    def calc_price_strikes(self, samples, productname):
        return dict([(strike, self.calc_price(samples,
                                              productname,
                                              selection=None,
                                              strike=strike))
                     for strike in Strikes])

    def calc_price_selections_strikes(self, samples, productname):
        def calc_price_selection(selection):
            return dict([(strike, self.calc_price(samples,
                                                  productname,
                                                  selection=selection,
                                                  strike=strike))
                         for strike in Strikes])
        return dict([(selection, calc_price_selection(selection))
                     for selection in Selections])

    def init_prices(self, samples):
        prices={}
        for key, attr in ProductRangeMapping.items():
            prices[key]=getattr(self, "calc_price_%s" % attr)(samples, key)
        return prices
        
    @validate_query({"league": "^\\D{3}\\.\\d$",
                     "window": "^\\d+$"})
    @task
    def post(self):
        leaguename=self.request.get("league")
        window=int(self.request.get("window"))
        cutoff=datetime.date.today()+datetime.timedelta(days=window)
        fixtures=ebadi.get_remaining_fixtures(leaguename,
                                              Leagues[leaguename]["season"])
        fixtures=sorted([{"league": leaguename,
                          "name": fixture["name"],
                          "kickoff": fixture["kickoff"],
                          "1x2_prices": self.normalise_1x2_prices(self.filter_best_1x2_prices(fixture["pre_event_1x2_prices"]))}
                         for fixture in fixtures
                         if self.filterfn(fixture, cutoff)],
                        key=lambda x: "%s/%s" % (x["kickoff"], x["name"]))
        for fixture in fixtures:
            self.calc_dc_grid(fixture)
            grid=CSGrid(fixture["dc_grid"])
            samples=grid.simulate(paths=Paths, seed=Seed)
            fixture["prices"]=self.init_prices(samples)
        MemBlob(key_name="fixtures/%s" % leaguename,
                text=json_dumps(fixtures),
                timestamp=datetime.datetime.now()).put()
        logging.info("Saved %i %s fixtures" % (len(fixtures), leaguename))
            
Routing=[('/tasks/fixtures/league', LeagueHandler),
         ('/tasks/fixtures', IndexHandler)]

app=webapp2.WSGIApplication(Routing)


