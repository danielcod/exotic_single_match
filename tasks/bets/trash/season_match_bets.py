from tasks.bets.trash import *

from models.bets.positions.season_match_bets import SeasonMatchBet

# curl "http://localhost:8080/tasks/bets/trash/season_match_bets"

class IndexHandler(webapp2.RequestHandler):

    @task
    def get(self):         
        leaguenames=[leaguename 
                     for leaguename in self.request.get("leagues").split(",")
                     if leaguename in Leagues.keys()]
        if leaguenames==[]:
            leaguenames=Leagues.keys()
        [taskqueue.add(url="/tasks/bets/trash/season_match_bets/league",
                             params={"league": leaguename},
                       queue_name=QueueName)
         for leaguename in leaguenames]
        logging.info("%s league tasks started" % len(leaguenames))

class LeagueHandler(webapp2.RequestHandler):

    @task
    def post(self):
        leaguename=self.request.get("league")
        bets=SeasonMatchBet.find_all(leaguename)
        for product in bets:
            product.delete()
        logging.info("Trashed %s SeasonMatchBet bets [%i]" % (leaguename, len(bets)))
        
Routing=[('/tasks/bets/trash/season_match_bets/league', LeagueHandler),
         ('/tasks/bets/trash/season_match_bets', IndexHandler)]

app=webapp2.WSGIApplication(Routing)



