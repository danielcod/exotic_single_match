from tasks.app import *

# curl "http://localhost:8080/tasks/app/matches?window=7&leagues=ENG.1"

class IndexHandler(webapp2.RequestHandler):

    @validate_query({"window": "^\\d+$"})
    @task
    def get(self):         
        leaguenames=[leaguename 
                     for leaguename in self.request.get("leagues").split(",")
                     if leaguename in Leagues.keys()]
        if leaguenames==[]:
            leaguenames=Leagues.keys()
        window=self.request.get("window")
        [taskqueue.add(url="/tasks/app/matches/map",
                       params={"league": leaguename,
                               "window": window},
                       queue_name=QueueName)
         for leaguename in leaguenames]
        logging.info("%s map tasks added" % len(leaguenames))
        taskqueue.add(url="/tasks/app/matches/reduce",
                      params={"leagues": ",".join(leaguenames)},
                      queue_name=QueueName)
        logging.info("Reduce task added")

class MapHandler(webapp2.RequestHandler):

    @validate_query({"league": "\\D{3}\\.\\d",
                     "window": "^\\d+$"})
    @task
    def post(self):
        leaguename=self.request.get("league")
        window=int(self.request.get("window"))
        cutoff=datetime.date.today()+datetime.timedelta(days=window)
        teamnames, items = [], []
        for match in sorted(yc_lite.get_upcoming_matches(leaguename),
                            key=lambda x: x["kickoff"]):
            if match["kickoff"].date() <= cutoff:
                continue
            matchteamnames=match["name"].split(" vs ")
            if (matchteamnames[0] not in teamnames and
                matchteamnames[1] not in teamnames):
                items.append({"league": leaguename,
                              "match": match["name"],
                              "kickoff": match["kickoff"]})
                teamnames+=matchteamnames
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
        Blob(key_name="matches",
             text=json_dumps(items),
             timestamp=datetime.datetime.now()).put()
        logging.info("Saved to /matches")
                
Routing=[('/tasks/app/matches/reduce', ReduceHandler),
         ('/tasks/app/matches/map', MapHandler),
         ('/tasks/app/matches', IndexHandler)]

app=webapp2.WSGIApplication(Routing)


