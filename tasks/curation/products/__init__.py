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

def pop_random_team(teams):
    i=int(random.random()*len(teams))
    return teams.pop(i)        

# curl "http://localhost:8080/tasks/curation/products?n=5"

class IndexHandler(webapp2.RequestHandler):
 
    @validate_query({'n': '\\d+'})
    @task
    def get(self):         
        n=int(self.request.get("n"))
        [taskqueue.add(url="/tasks/curation/products/%ss" % product["type"], # NB note pluralisation
                       params={"n": n},
                       queue_name=QueueName)
         for product in Products]
        taskqueue.add(url="/tasks/curation/products/reduce",
                      queue_name=QueueName)
        logging.info("%s tasks started" % (1+len(Products)))

class ReduceHandler(webapp2.RequestHandler):

    def randomise_bet_order(self, bets):
        import random
        return [bet for bet, _ in sorted([(bet, random.random())
                                          for bet in bets],
                                         key=lambda x: x[-1])]
            
    @task
    def post(self):
        bets=[]
        for product in Products:
            keyname="products/samples/%s" % product["type"]
            resp=memcache.get(keyname)
            if resp in ['', None, []]:
                continue
            bets+=json_loads(resp)            
        logging.info("Total %i samples" % len(bets))
        Blob(key_name="products/samples",
             text=json_dumps(self.randomise_bet_order(bets)),
             timestamp=datetime.datetime.now()).put()
        logging.info("Saved to products/samples")
        
Routing=[('/tasks/curation/products/reduce', ReduceHandler),
         ('/tasks/curation/products', IndexHandler)]

app=webapp2.WSGIApplication(Routing)
