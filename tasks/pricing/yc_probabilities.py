from tasks.pricing import *

# curl "http://localhost:8080/tasks/pricing/yc_probabilities?leagues=ENG.1"

class IndexHandler(webapp2.RequestHandler):

    @task
    def get(self):         
        leaguenames=[leaguename 
                     for leaguename in self.request.get("leagues").split(",")
                     if leaguename in Leagues.keys()]
        if leaguenames==[]:
            leaguenames=Leagues.keys()
        [taskqueue.add(url="/tasks/pricing/yc_probabilities/league",
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
        events=Fixture.find_all(leaguename, force=True) # NB for update
        count=0
        for event in events:
            if event.name not in remfixtures:
                continue
            event.yc_probabilities=remfixtures[event.name]["probabilities"]
            event.put()
            count+=1
        logging.info("Updated %i %s fixtures" % (count, leaguename))

Routing=[('/tasks/pricing/yc_probabilities/league', LeagueHandler),
         ('/tasks/pricing/yc_probabilities', IndexHandler)]

app=webapp2.WSGIApplication(Routing)
