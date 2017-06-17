from tasks.app import *

# curl "http://localhost:8080/tasks/app/matches"

class IndexHandler(webapp2.RequestHandler):

    @task
    def get(self):         
        leaguenames=[leaguename 
                     for leaguename in self.request.get("leagues").split(",")
                     if leaguename in Leagues.keys()]
        if leaguenames==[]:
            leaguenames=Leagues.keys()
        [taskqueue.add(url="/tasks/app/matches/map",
                       params={"league": leaguename},
                       queue_name=QueueName)
         for leaguename in leaguenames]
        logging.info("%s map tasks added" % len(leaguenames))
        taskqueue.add(url="/tasks/app/matches/reduce",
                      params={"leagues": ",".join(leaguenames)},
                      queue_name=QueueName)
        logging.info("Reduce task added")

def filter_best_1x2_prices(prices):
    best={}
    for price in prices:
        for attr in ["1", "x", "2"]:
            best.setdefault(attr, 1.0)
            value=price["price_%s" % attr]
            if value > best[attr]:
                best[attr]=value
    return [best[attr]
            for attr in ["1", "x", "2"]]
        
class MapHandler(webapp2.RequestHandler):

    @validate_query({"league": "\\D{3}\\.\\d"})
    @task
    def post(self):
        leaguename=self.request.get("league")
        items=sorted([{"league": leaguename,
                       "name": match["name"],
                       "kickoff": match["kickoff"],
                       "prices": filter_best_1x2_prices(match["pre_event_1x2_prices"])}
                      for match in ebadi.get_remaining_fixtures(leaguename,
                                                                Leagues[leaguename]["season"])
                      if ("pre_event_1x2_prices" in match and
                          match["pre_event_1x2_prices"] not in [[], None])],
                     key=lambda x: "%s/%s" % (x["kickoff"], x["name"]))
        keyname="matches/%s" % leaguename
        memcache.set(keyname, json_dumps(items), MemcacheAge)
        logging.info("Filtered %i %s matches" % (len(items), keyname))

class ReduceHandler(webapp2.RequestHandler):

    @validate_query({"leagues": "(\\D{3}\\.\\d\\,)*(\\D{3}\\.\\d)"})
    @task
    def post(self):
        leaguenames=self.request.get("leagues").split(",")
        items=[]
        for leaguename in leaguenames:
            keyname="matches/%s" % leaguename
            resp=memcache.get(keyname)
            if resp in ['', None, []]:
                continue
            items+=json_loads(resp)
        logging.info("Total %i matches" % len(items))
        Blob(key_name="app/matches",
             text=json_dumps(items),
             timestamp=datetime.datetime.now()).put()
        logging.info("Saved to /matches")
                
Routing=[('/tasks/app/matches/reduce', ReduceHandler),
         ('/tasks/app/matches/map', MapHandler),
         ('/tasks/app/matches', IndexHandler)]

app=webapp2.WSGIApplication(Routing)


