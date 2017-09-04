from tasks import *

QueueName="quant"

# curl "http://localhost:8080/tasks/fixtures?window=30"

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
        from quant.dixon_coles import CSGrid
        lx, ly, err = CSGrid.solve(probs)
        formatstr="%s/%s :: lx -> %.5f, ly -> %.5f, err -> %.5f"
        logging.info(formatstr % (fixture["league"],
                                  fixture["name"],
                                  lx, ly, err))
        fixture["dc_grid"]=CSGrid.from_poisson(lx, ly)

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
        MemBlob(key_name="fixtures/%s" % leaguename,
                text=json_dumps(fixtures),
                timestamp=datetime.datetime.now()).put()
        logging.info("Saved %i %s fixtures" % (len(fixtures), leaguename))
            
Routing=[('/tasks/fixtures/league', LeagueHandler),
         ('/tasks/fixtures', IndexHandler)]

app=webapp2.WSGIApplication(Routing)


