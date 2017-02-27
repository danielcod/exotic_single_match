from tasks.pricing import *

import sport_data_client.services.event_matcher as event_matcher

import sport_data_client.scrapers.bbc_football as bbc

# NB override default leagues

Leagues=dict([(league["name"], league)
              for league in yaml.load(file("config/bbc.yaml").read())])

DefaultDateCutoff=datetime.date(2016, 7, 15)

BBC="BBC"

def get_date_cutoff(leaguename):
    return DefaultDateCutoff

# curl "http://localhost:8080/tasks/pricing/bbc_fixtures?leagues=ENG.1"

class IndexHandler(webapp2.RequestHandler):

    @task
    def get(self):         
        leaguenames=[leaguename 
                     for leaguename in self.request.get("leagues").split(",")
                     if leaguename in Leagues.keys()]
        if leaguenames==[]:
            leaguenames=Leagues.keys()
        [taskqueue.add(url="/tasks/pricing/bbc_fixtures/league",
                       params={"league": leaguename},
                       queue_name=QueueName)
         for leaguename in leaguenames]
        logging.info("%s league tasks started" % len(leaguenames))

class LeagueHandler(webapp2.RequestHandler):

    def update_fixtures(self, leaguename, fixtures, matched):
        timestamp=dst_adjust(datetime.datetime.utcnow())
        for fixture in fixtures:
            fixture["league"]=leaguename
            fixture["name"]=matched[fixture["name"]]["value"]
            fixture["key_name"]="%s/%s" % (fixture["league"],
                                           fixture["name"])

    @validate_query({"league": "\\D{3}\\.\\d"})
    @task
    def post(self):
        leaguename=self.request.get("league")
        cutoff=get_date_cutoff(leaguename)
        fixtures=bbc.get_fixtures(Leagues[leaguename]["id"], **SDKwargs)
        fixtures=[fixture for fixture in fixtures
                 if fixture["date"] >= cutoff]
        if fixtures==[]:
            logging.info("No %s %s fixtures" % (BBC, leaguename))
            return
        queries=[fixture["name"] for fixture in fixtures]
        resp=event_matcher.match_events(leaguename, queries, **SDKwargs)        
        if resp["unmatched"]!=[]:
            logging.warning("Couldn't match %s" % ", ".join(resp["unmatched"]))
        fixtures=[fixture for fixture in fixtures
                if fixture["name"] in resp["matched"]]
        self.update_fixtures(leaguename, fixtures, resp["matched"])
        [Fixture(**fixture).put() 
         for fixture in fixtures]
        logging.info("Updated %i %s %s fixtures" % (len(fixtures), BBC, leaguename))

Routing=[('/tasks/pricing/bbc_fixtures/league', LeagueHandler),
         ('/tasks/pricing/bbc_fixtures', IndexHandler)]

app=webapp2.WSGIApplication(Routing)

