from tasks.blobs import *

# curl "http://localhost:8080/tasks/blobs/teams?leagues=ENG.1"

class IndexHandler(webapp2.RequestHandler):

    @task
    def get(self):         
        leaguenames=[leaguename 
                     for leaguename in self.request.get("leagues").split(",")
                     if leaguename in Leagues.keys()]
        if leaguenames==[]:
            leaguenames=Leagues.keys()
        [taskqueue.add(url="/tasks/blobs/teams/map",
                       params={"league": leaguename},
                       queue_name=QueueName)
         for leaguename in leaguenames]
        logging.info("%s map tasks added" % len(leaguenames))
        taskqueue.add(url="/tasks/blobs/teams/reduce",
                      params={"leagues": ",".join(leaguenames)},
                      queue_name=QueueName)
        logging.info("Reduce task added")

class MapHandler(webapp2.RequestHandler):

    @validate_query({"league": "\\D{3}\\.\\d"})
    @task
    def post(self):
        leaguename=self.request.get("league")
        items=[{"league": leaguename,
                "name": team["name"]}
               for team in yc_lite.get_teams(leaguename)]
        keyname="teams/%s" % leaguename
        memcache.add(keyname, json_dumps(items), MemcacheAge)
        logging.info("Filtered %i %s teams" % (len(items), keyname))

class ReduceHandler(webapp2.RequestHandler):

    @validate_query({"leagues": "(\\D{3}\\.\\d\\,)*(\\D{3}\\.\\d)"})
    @task
    def post(self):
        leaguenames=self.request.get("leagues").split(",")
        items=[]
        for leaguename in leaguenames:
            keyname="teams/%s" % leaguename
            resp=memcache.get(keyname)
            if resp in ['', None, []]:
                continue
            items+=json_loads(resp)
        logging.info("Total %i teams" % len(items))
        Blob(key_name="teams",
             text=json_dumps(items),
             timestamp=datetime.datetime.now()).put()
        logging.info("Saved to /teams")
                
Routing=[('/tasks/blobs/teams/reduce', ReduceHandler),
         ('/tasks/blobs/teams/map', MapHandler),
         ('/tasks/blobs/teams', IndexHandler)]

app=webapp2.WSGIApplication(Routing)


