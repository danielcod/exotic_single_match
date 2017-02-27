from tasks.blobs import *

from models.products.positions.season_match_bets import SeasonMatchBetProduct

# curl "http://localhost:8080/tasks/blobs/smb_versus?leagues=ENG.1"

class IndexHandler(webapp2.RequestHandler):

    @task
    def get(self):         
        leaguenames=[leaguename 
                     for leaguename in self.request.get("leagues").split(",")
                     if leaguename in Leagues.keys()]
        if leaguenames==[]:
            leaguenames=Leagues.keys()
        [taskqueue.add(url="/tasks/blobs/smb_versus/league",
                       params={"league": leaguename},
                       queue_name=QueueName)
         for leaguename in leaguenames]
        logging.info("%s league tasks started" % len(leaguenames))

class LeagueHandler(webapp2.RequestHandler):

    @validate_query({"league": "\\D{3}\\.\\d"})
    @task
    def post(self):
        leaguename=self.request.get("league")
        versus=SeasonMatchBetProduct.filter_atm_versus(leaguename)
        logging.info(versus)
        
Routing=[('/tasks/blobs/smb_versus/league', LeagueHandler),
         ('/tasks/blobs/smb_versus', IndexHandler)]

app=webapp2.WSGIApplication(Routing)


