from tasks.random import *

from models.products.positions import calc_positional_probability

import quant.simulator as simulator

from models.products.positions.season_match_bets import SeasonMatchBetProduct

Winner="Winner"

def sumproduct(X, Y):
    return sum([(x*y) for x, y in zip(X, Y)])

# curl "http://localhost:8080/tasks/random/season_match_bets?n=20"

class IndexHandler(webapp2.RequestHandler):

    @validate_query({'n': '\\d+'})
    @task
    def get(self):
        n=int(self.request.get("n"))
        tasks=[taskqueue.add(url="/tasks/random/season_match_bets/init")
               for i in range(n)]
        logging.info("%s league tasks started" % n)

class InitHandler(webapp2.RequestHandler):

    def init_versus(self, teamname, teams, nmax=50):
        for i in range(nmax):
            j=int(len(teams)*random.random())
            versusname=teams[j]["name"]
            if teamname!=versusname:
                return versusname
        raise RuntimeError("Couldn't find versus team")        

    """
    - this stuff should be moved into product model
    """
    
    def calc_pp_surface(self, leaguename, teams, expiry, paths=1000, seed=13):
        results=yc_lite.get_results(leaguename)        
        fixtures=[{"name": fixture["name"],
                   "date": fixture["date"],
                   "probabilities": fixture["yc_probabilities"]}
                   for fixture in [fixture.to_json()
                                   for fixture in Fixture.find_all(leaguename)]]
        today=datetime.date.today()
        fixtures=[fixture for fixture in fixtures
                  if (fixture["date"] > today and
                      fixture["date"] < expiry["value"])]
        return simulator.simulate(teams,
                                  results,
                                  fixtures,
                                  paths, seed)

    def calc_prices(self, leaguename, teamname, versusname, expiry, teams):
        results=yc_lite.get_results(leaguename)        
        fixtures=[{"name": fixture["name"],
                   "date": fixture["date"],
                   "probabilities": fixture["yc_probabilities"]}
                   for fixture in [fixture.to_json()
                                   for fixture in Fixture.find_all(leaguename)]]
        today=datetime.date.today()
        fixtures=[fixture for fixture in fixtures
                  if (fixture["date"] > today and
                      fixture["date"] < expiry["value"])]
        struct={"team": {"league": leaguename,
                         "name": teamname},
                "teams": [team for team in teams
                          if team["name"] in [teamname, versusname]],
                "results": [result for result in results
                            if (teamname in result["name"] or
                                versusname in result["name"])],
                "fixtures": [fixture for fixture in fixtures
                             if (teamname in fixture["name"] or
                                 versusname in fixture["name"])],
                "payoffs": [{"name": "Winner"}]}
        return calc_positional_probability(struct)

    @task
    def post(self, std=3):        
        random.seed(random_seed())
        i=int(len(Expiries)*random.random())
        expiry=Expiries[i]
        i=int(len(Leagues)*random.random())
        leaguename=Leagues[i]["name"]
        teams=yc_lite.get_teams(leaguename)
        pp=self.calc_pp_surface(leaguename, teams, expiry)
        pp=sorted([(key, values)
                   for key, values in pp.items()],
                  key=lambda x: sumproduct(x[1], range(len(x[1]))))
        teamnames=[row[0] for row in pp]
        i=std+int((len(teams)-(2*std))*random.random())
        teamname=teamnames[i]
        f=1 if random.random() > 0.5 else -1
        j=i+f*(1+int((std-1)*random.random()))
        versusname=teamnames[j]
        items=self.calc_prices(leaguename,
                               teamname,
                               versusname,
                               expiry,
                               teams)
        probability=items[0]["value"]
        price=format_price(probability)
        SeasonMatchBetProduct(league=leaguename,
                              team=teamname,
                              versus=versusname,
                              expiry=expiry["value"],
                              price=price).put()
        logging.info("%s/%s/%s/%s -> %s" % (leaguename,
                                            teamname,
                                            versusname,
                                            expiry["value"],
                                            price))
        
Routing=[('/tasks/random/season_match_bets/init', InitHandler),
         ('/tasks/random/season_match_bets', IndexHandler)]

app=webapp2.WSGIApplication(Routing)
