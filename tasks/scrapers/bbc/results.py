from tasks.scrapers.bbc import *

# curl "http://localhost:8080/tasks/scrapers/bbc/results?leagues=ENG.1"

class IndexHandler(webapp2.RequestHandler):

    @task
    def get(self):         
        leaguenames=[leaguename 
                     for leaguename in self.request.get("leagues").split(",")
                     if leaguename in Leagues.keys()]
        if leaguenames==[]:
            leaguenames=Leagues.keys()
        [taskqueue.add(url="/tasks/scrapers/bbc/results/league",
                       params={"league": leaguename},
                       queue_name=QueueName)
         for leaguename in leaguenames]
        logging.info("%s league tasks started" % len(leaguenames))

class LeagueHandler(webapp2.RequestHandler):

    def update_results(self, leaguename, results, matched):
        timestamp=dst_adjust(datetime.datetime.utcnow())
        for result in results:
            result["league"]=leaguename
            result["name"]=matched[result["name"]]["value"]
            result["source"]=BBC
            result["key_name"]="%s/%s/%s" % (result["league"],
                                             result["name"],
                                             result["source"])
            result["status"]=Result
            # result["settlement_prices"]=result.pop("prices")
            result["timestamp"]=timestamp
            result["score"]=list(result["score"])

    @validate_query({"league": "\\D{3}\\.\\d"})
    @task
    def post(self):
        leaguename=self.request.get("league")
        cutoff=get_date_cutoff(leaguename)
        results=bbc.get_results(Leagues[leaguename]["id"], **SDKwargs)
        results=[result for result in results
                 if result["date"] >= cutoff]
        if results==[]:
            logging.info("No %s %s results" % (BBC, leaguename))
            return
        queries=[result["name"] for result in results]
        resp=event_matcher.match_events(leaguename, queries, **SDKwargs)        
        if resp["unmatched"]!=[]:
            logging.warning("Couldn't match %s" % ", ".join(resp["unmatched"]))
        results=[result for result in results
                if result["name"] in resp["matched"]]
        logging.info(results) # TEMP
        logging.info("Updated %i %s %s results" % (len(results), BBC, leaguename))

Routing=[('/tasks/scrapers/bbc/results/league', LeagueHandler),
         ('/tasks/scrapers/bbc/results', IndexHandler)]

app=webapp2.WSGIApplication(Routing)

