from tasks.products.delete import *

from models.products.positions.season_match_bets import SeasonMatchBetProduct

# curl "http://localhost:8080/tasks/products/delete/season_match_bets"

class IndexHandler(webapp2.RequestHandler):

    @task
    def get(self):         
        leaguenames=[leaguename 
                     for leaguename in self.request.get("leagues").split(",")
                     if leaguename in Leagues.keys()]
        if leaguenames==[]:
            leaguenames=Leagues.keys()
        [taskqueue.add(url="/tasks/products/delete/season_match_bets/league",
                             params={"league": leaguename},
                       queue_name=QueueName)
         for leaguename in leaguenames]
        logging.info("%s league tasks started" % len(leaguenames))

class LeagueHandler(webapp2.RequestHandler):

    @task
    def post(self):
        leaguename=self.request.get("league")
        products=SeasonMatchBetProduct.find_all(leaguename)
        for product in products:
            product.delete()
        logging.info("Deleted %s SeasonMatchBet bets [%i]" % (leaguename, len(products)))
        
Routing=[('/tasks/products/delete/season_match_bets/league', LeagueHandler),
         ('/tasks/products/delete/season_match_bets', IndexHandler)]

app=webapp2.WSGIApplication(Routing)



