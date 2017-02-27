from tasks.blobs import *

from models.products.positions.single_team_outrights import SingleTeamOutrightProduct

# curl "http://localhost:8080/tasks/blobs/outright_payoffs?leagues=ENG.1"

class IndexHandler(webapp2.RequestHandler):

    @task
    def get(self):         
        leaguenames=[leaguename 
                     for leaguename in self.request.get("leagues").split(",")
                     if leaguename in Leagues.keys()]
        if leaguenames==[]:
            leaguenames=Leagues.keys()
        [taskqueue.add(url="/tasks/blobs/outright_payoffs/league",
                       params={"league": leaguename},
                       queue_name=QueueName)
         for leaguename in leaguenames]
        logging.info("%s league tasks started" % len(leaguenames))

class LeagueHandler(webapp2.RequestHandler):

    @validate_query({"league": "\\D{3}\\.\\d"})
    @task
    def post(self):
        leaguename=self.request.get("league")
        payoffs=SingleTeamOutrightProduct.filter_atm_payoffs(leaguename)
        logging.info(payoffs)
        
Routing=[('/tasks/blobs/outright_payoffs/league', LeagueHandler),
         ('/tasks/blobs/outright_payoffs', IndexHandler)]

app=webapp2.WSGIApplication(Routing)


