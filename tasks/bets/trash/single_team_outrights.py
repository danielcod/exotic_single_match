from tasks.bets.trash import *

from models.bets.positions.single_team_outrights import SingleTeamOutrightBet

# curl "http://localhost:8080/tasks/bets/trash/single_team_outrights"

class IndexHandler(webapp2.RequestHandler):

    @task
    def get(self):         
        leaguenames=[leaguename 
                     for leaguename in self.request.get("leagues").split(",")
                     if leaguename in Leagues.keys()]
        if leaguenames==[]:
            leaguenames=Leagues.keys()
        [taskqueue.add(url="/tasks/bets/trash/single_team_outrights/league",
                       params={"league": leaguename},
                       queue_name=QueueName)
         for leaguename in leaguenames]
        logging.info("%s league tasks started" % len(leaguenames))

class LeagueHandler(webapp2.RequestHandler):

    @task
    def post(self):
        leaguename=self.request.get("league")
        bets=SingleTeamOutrightBet.find_all(leaguename)
        for bet in bets:
            bet.delete()
        logging.info("Trashed %s SeasonTeamOutright bets [%i]" % (leaguename, len(bets)))
        
Routing=[('/tasks/bets/trash/single_team_outrights/league', LeagueHandler),
         ('/tasks/bets/trash/single_team_outrights', IndexHandler)]

app=webapp2.WSGIApplication(Routing)
