from tasks.curation import *

import random

def load_top_teams(cutoff=4):
    leaguenames=[leaguename for leaguename in Leagues.keys()
                 if leaguename.endswith(".1")]    
    teams=[]
    for leaguename in leaguenames:
        teams+=sorted(yc_lite.get_teams(leaguename),
                      key=lambda x: -x["expected_season_points"])[:cutoff]
    return teams

TopTeams=load_top_teams()

TopTeamNames=[team["name"] for team in TopTeams]

# curl "http://localhost:8080/tasks/curation/samples?n=1"

class IndexHandler(webapp2.RequestHandler):
 
    @validate_query({'n': '\\d+'})
    @task
    def get(self):         
        n=int(self.request.get("n"))
        [taskqueue.add(url="/tasks/curation/samples/%ss" % product["type"], # NB note pluralisation
                       params={"i": i},
                       queue_name=QueueName)
         for product in Products
         for i in range(n)]
        taskqueue.add(url="/tasks/curation/samples/reduce",
                      params={"n": n},
                      queue_name=QueueName)
        logging.info("%s tasks started" % (1+len(Products)*n))

class ReduceHandler(webapp2.RequestHandler):

    def randomise_bet_order(self, bets):
        import random
        return [bet for bet, _ in sorted([(bet, random.random())
                                          for bet in bets],
                                         key=lambda x: x[-1])]

    @validate_query({"n": "\\d+"})
    @task
    def post(self):
        n=int(self.request.get("n"))
        bets=[]
        for product in Products:
            for i in range(n):
                keyname="products/samples/%s/%i" % (product["type"], i)
                resp=memcache.get(keyname)
                if resp in ['', None, []]:
                    logging.warning("Couldn't lookup %s from memcache" % keyname)
                    continue
                bets.append(json_loads(resp))
        logging.info("Total %i samples" % len(bets))
        Blob(key_name="products/samples",
             text=json_dumps(self.randomise_bet_order(bets)),
             timestamp=datetime.datetime.now()).put()
        logging.info("Saved to products/samples")
        
Routing=[('/tasks/curation/samples/reduce', ReduceHandler),
         ('/tasks/curation/samples', IndexHandler)]

app=webapp2.WSGIApplication(Routing)
