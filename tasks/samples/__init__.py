from tasks import *

import apis.yc_lite_api as yc_lite

import random

Leagues=dict([(league["name"], league)
              for league in yaml.load(file("config/leagues.yaml").read())])

Products=yaml.load(file("config/products.yaml").read())

def end_of_season(today):
    if today.month < 7:
        return datetime.date(today.year, 6, 30)
    else:
        return datetime.date(today.year+1, 6, 30)

EndOfSeason=end_of_season(datetime.date.today())

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

# curl "http://localhost:8080/tasks/samples?n=1"

class IndexHandler(webapp2.RequestHandler):
 
    @validate_query({'n': '\\d+'})
    @task
    def get(self):         
        n=int(self.request.get("n"))
        [taskqueue.add(url="/tasks/samples/%ss" % product["type"], # NB note pluralisation
                       params={"i": i},
                       queue_name=QueueName)
         for product in Products
         for i in range(n)]
        taskqueue.add(url="/tasks/samples/reduce",
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
        
Routing=[('/tasks/samples/reduce', ReduceHandler),
         ('/tasks/samples', IndexHandler)]

app=webapp2.WSGIApplication(Routing)
