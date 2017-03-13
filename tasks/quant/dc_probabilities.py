from tasks.quant import *

# curl "http://localhost:8080/tasks/quant/dc_probabilities?leagues=ENG.1"

class IndexHandler(webapp2.RequestHandler):

    @task
    def get(self):         
        leaguenames=[leaguename 
                     for leaguename in self.request.get("leagues").split(",")
                     if leaguename in Leagues.keys()]
        if leaguenames==[]:
            leaguenames=Leagues.keys()
        [taskqueue.add(url="/tasks/quant/dc_probabilities/league",
                       params={"league": leaguename},
                       queue_name=QueueName)
         for leaguename in leaguenames]
        logging.info("%s league tasks started" % len(leaguenames))

class LeagueHandler(webapp2.RequestHandler):

    @validate_query({"league": "\\D{3}\\.\\d"})
    @task
    def post(self):
        leaguename=self.request.get("league")
        remfixtures=dict([(fixture["name"], fixture)
                          for fixture in yc_lite.get_remaining_fixtures(leaguename)])
        events=[event for event in Fixture.find_all(leaguename)
                if event.name in remfixtures]
        logging.info("%i fixtures found [%s]" % (len(events), leaguename))

Routing=[('/tasks/quant/dc_probabilities/league', LeagueHandler),
         ('/tasks/quant/dc_probabilities', IndexHandler)]

app=webapp2.WSGIApplication(Routing)

