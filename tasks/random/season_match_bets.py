from tasks.random import *

from models.products.positions import calc_positional_probability

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

    @task
    def post(self):
        random.seed(random_seed())
        i=int(len(Expiries)*random.random())
        expiry=Expiries[i]
        i=int(len(Leagues)*random.random())
        leaguename=Leagues[i]["name"]        
        teams=yc_lite.get_teams(leaguename)
        i=int(len(teams)*random.random())
        teamname=teams[i]["name"]
        i=int(len(teams)*random.random())
        def init_versusname(nmax=50):
            for i in range(nmax):
                j=int(len(teams)*random.random())
                versusname=teams[j]["name"]
                if teamname!=versusname:
                    return versusname
            raise RuntimeError("Couldn't find versus team")
        versusname=init_versusname()
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
        
Routing=[('/tasks/random/season_match_bets/init', InitHandler),
         ('/tasks/random/season_match_bets', IndexHandler)]

app=webapp2.WSGIApplication(Routing)
