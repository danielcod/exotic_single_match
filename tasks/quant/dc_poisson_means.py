from tasks.quant import *

from quant.dixon_coles import CSGrid

"""
- MaxError 0.001 fails a small %age of matches
"""

MaxError=0.005

# curl "http://localhost:8080/tasks/quant/dc_poisson_means?leagues=ENG.1"

class IndexHandler(webapp2.RequestHandler):

    @task
    def get(self):         
        leaguenames=[leaguename 
                     for leaguename in self.request.get("leagues").split(",")
                     if leaguename in Leagues.keys()]
        if leaguenames==[]:
            leaguenames=Leagues.keys()
        [taskqueue.add(url="/tasks/quant/dc_poisson_means/league",
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
        [taskqueue.add(url="/tasks/quant/dc_poisson_means/fixture",
                       params={"league": leaguename,
                               "event": event.name},
                       queue_name=QueueName)
         for event in events]
        logging.info("%i %s fixture tasks started" % (len(events), leaguename))

class FixtureHandler(webapp2.RequestHandler):

    @validate_query({"league": "\\D{3}\\.\\d",
                     "event": ".+"})
    @task
    def post(self):
        leaguename=self.request.get("league")
        eventname=self.request.get("event")
        keyname="%s/%s" % (leaguename, eventname)
        event=Fixture.get_by_key_name(keyname)
        if not event:
            raise RuntimeError("%s not found" % keyname)
        lx, ly, err = CSGrid.solve(event.yc_probabilities)
        if err > MaxError:
            raise RuntimeError("%s error [%.5f] exceeded max [%.5f]" % (keyname, err, MaxError))
        event.dc_poisson_means=[lx, ly]
        event.dc_error=err
        event.put()
        logging.info("Updated %s :: %.5f/%.5f -> %.5f" % (keyname,
                                                          lx, ly,
                                                          err))
        
Routing=[('/tasks/quant/dc_poisson_means/league', LeagueHandler),
         ('/tasks/quant/dc_poisson_means/fixture', FixtureHandler),
         ('/tasks/quant/dc_poisson_means', IndexHandler)]

app=webapp2.WSGIApplication(Routing)

