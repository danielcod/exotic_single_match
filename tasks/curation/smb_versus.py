from tasks.curation import *

# curl "http://localhost:8080/tasks/curation/smb_versus"

class IndexHandler(webapp2.RequestHandler):

    @task
    def get(self):         
        leaguenames=[leaguename 
                     for leaguename in self.request.get("leagues").split(",")
                     if leaguename in Leagues.keys()]
        if leaguenames==[]:
            leaguenames=Leagues.keys()
        [taskqueue.add(url="/tasks/curation/smb_versus/map",
                       params={"league": leaguename},
                       queue_name=QueueName)
         for leaguename in leaguenames]
        logging.info("%s map tasks added" % len(leaguenames))
        taskqueue.add(url="/tasks/curation/smb_versus/reduce",
                      params={"leagues": ",".join(leaguenames)},
                      queue_name=QueueName)
        logging.info("Reduce task added")

class MapHandler(webapp2.RequestHandler):

    @validate_query({"league": "\\D{3}\\.\\d"})
    @task
    def post(self):
        leaguename=self.request.get("league")
        items=SeasonMatchBet.filter_atm_versus(leaguename)
        keyname="products/smb_versus/%s" % leaguename
        memcache.set(keyname, json_dumps(items), MemcacheAge)
        logging.info("Filtered %i %s SMB versus" % (len(items), keyname))

class ReduceHandler(webapp2.RequestHandler):

    @validate_query({"leagues": "(\\D{3}\\.\\d\\,)*(\\D{3}\\.\\d)"})
    @task
    def post(self):
        leaguenames=self.request.get("leagues").split(",")
        items=[]
        for leaguename in leaguenames:
            keyname="products/smb_versus/%s" % leaguename
            resp=memcache.get(keyname)
            if resp in ['', None, []]:
                continue
            items+=json_loads(resp)
        logging.info("Total %i SMB versus" % len(items))
        Blob(key_name="products/smb_versus",
             text=json_dumps(items),
             timestamp=datetime.datetime.now()).put()
        logging.info("Saved to products/smb_versus")
                
Routing=[('/tasks/curation/smb_versus/reduce', ReduceHandler),
         ('/tasks/curation/smb_versus/map', MapHandler),
         ('/tasks/curation/smb_versus', IndexHandler)]

app=webapp2.WSGIApplication(Routing)