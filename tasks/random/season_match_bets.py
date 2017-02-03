from tasks.random import *

# from models.products.positions import calc_positional_probability

import quant.simulator as simulator

from models.products.positions.season_match_bets import SeasonMatchBetProduct

# curl "http://localhost:8080/tasks/random/season_match_bets?n=10"

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
    - this should be moved into product model
    """
    
    def calc_pp_surface(self, leaguename, expiry, paths=1000, seed=13):
        teams=yc_lite.get_teams(leaguename)
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
    
    """
        teams=yc_lite.get_teams(leaguename)
        i=int(len(teams)*random.random())
        teamname=teams[i]["name"]
        i=int(len(teams)*random.random())
        versusname=self.init_versus(teamname, teams)
        probability=0.1+0.8*random.random()
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
    """
    
    @task
    def post(self):
        random.seed(random_seed())
        i=int(len(Expiries)*random.random())
        expiry=Expiries[i]
        i=int(len(Leagues)*random.random())
        leaguename=Leagues[i]["name"]        
        pp=self.calc_pp_surface(leaguename, expiry)
        logging.info(pp)
        
Routing=[('/tasks/random/season_match_bets/init', InitHandler),
         ('/tasks/random/season_match_bets', IndexHandler)]

app=webapp2.WSGIApplication(Routing)
