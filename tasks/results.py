from tasks import *

QueueName="quant"

# curl "http://localhost:8080/tasks/results"

class IndexHandler(webapp2.RequestHandler):

    @task
    def get(self):         
        leaguenames=[leaguename 
                     for leaguename in self.request.get("leagues").split(",")
                     if leaguename in Leagues.keys()]
        if leaguenames==[]:
            leaguenames=Leagues.keys()
        [taskqueue.add(url="/tasks/results/league",
                       params={"league": leaguename},
                       queue_name=QueueName)
         for leaguename in leaguenames]
        logging.info("%s league tasks added" % len(leaguenames))

class LeagueHandler(webapp2.RequestHandler):

    def filter_best_1x2_prices(self, prices):
        best={}
        for price in prices:
            for attr in ["1", "x", "2"]:
                best.setdefault(attr, 1.0)
                value=price["price_%s" % attr]
                if value > best[attr]:
                    best[attr]=value
        return [best[attr]
                for attr in ["1", "x", "2"]]

    def normalise_1x2_prices(self, prices):
        probs=[1/float(price)
               for price in prices]
        overround=sum(probs)
        normprobs=[prob/float(overround)
                   for prob in probs]
        return [1/float(prob)
                for prob in normprobs]

    @validate_query({"league": "^\\D{3}\\.\\d$"})
    @task
    def post(self):
        leaguename=self.request.get("league")
        results=ebadi.get_results(leaguename,
                                  Leagues[leaguename]["season"])
        results=sorted([{"league": leaguename,
                         "name": result["name"],
                         "kickoff": result["kickoff"],
                         "1x2_prices": self.normalise_1x2_prices(self.filter_best_1x2_prices(result["pre_event_1x2_prices"]))}
                         for result in results],
                        key=lambda x: "%s/%s" % (x["kickoff"], x["name"]))
        MemBlob(key_name="results/%s" % leaguename,
                text=json_dumps(results),
                timestamp=datetime.datetime.now()).put()
        logging.info("Saved %i %s results" % (len(results), leaguename))
            
Routing=[('/tasks/results/league', LeagueHandler),
         ('/tasks/results', IndexHandler)]

app=webapp2.WSGIApplication(Routing)


