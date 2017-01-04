from tasks.scrapers.bbc import *

# curl "http://localhost:8080/tasks/scrapers/bbc/fixtures?leagues=ENG.1"

class IndexHandler(webapp2.RequestHandler):

    @task
    def get(self):         
        leaguenames=[leaguename 
                     for leaguename in self.request.get("leagues").split(",")
                     if leaguename in Leagues.keys()]
        if leaguenames==[]:
            leaguenames=Leagues.keys()
        [taskqueue.add(url="/tasks/scrapers/bbc/fixtures/league",
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
            fixture["source"]=BBC
            fixture["key_name"]="%s/%s/%s" % (fixture["league"],
                                             fixture["name"],
                                             fixture["source"])
            # fixture["status"]=Fixture
            # fixture["settlement_prices"]=fixture.pop("prices")
            fixture["timestamp"]=timestamp
            # fixture["score"]=list(fixture["score"])

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
        [Event(**fixture).put() 
         for fixture in fixtures]
        logging.info("Updated %i %s %s fixtures" % (len(fixtures), BBC, leaguename))

Routing=[('/tasks/scrapers/bbc/fixtures/league', LeagueHandler),
         ('/tasks/scrapers/bbc/fixtures', IndexHandler)]

app=webapp2.WSGIApplication(Routing)

