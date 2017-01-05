from tasks import *

Leagues=dict([(league["name"], league)
              for league in yaml.load(file("config/bbc.yaml").read())])

QueueName="default"

# curl "http://localhost:8080/tasks/yc_probabilities?leagues=ENG.1"

class IndexHandler(webapp2.RequestHandler):

    @task
    def get(self):         
        leaguenames=[leaguename 
                     for leaguename in self.request.get("leagues").split(",")
                     if leaguename in Leagues.keys()]
        if leaguenames==[]:
            leaguenames=Leagues.keys()
        [taskqueue.add(url="/tasks/yc_probabilities/league",
                       params={"league": leaguename},
                       queue_name=QueueName)
         for leaguename in leaguenames]
        logging.info("%s league tasks started" % len(leaguenames))

class LeagueHandler(webapp2.RequestHandler):

    @validate_query({"league": "\\D{3}\\.\\d"})
    @task
    def post(self):
        leaguename=self.request.get("league")
        logging.info(leaguename)

Routing=[('/tasks/yc_probabilities/league', LeagueHandler),
         ('/tasks/yc_probabilities', IndexHandler)]

app=webapp2.WSGIApplication(Routing)

