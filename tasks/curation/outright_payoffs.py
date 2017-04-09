from tasks.curation import *

# curl "http://localhost:8080/tasks/curation/outright_payoffs"

class IndexHandler(webapp2.RequestHandler):

    @task
    def get(self):         
        leaguenames=[leaguename 
                     for leaguename in self.request.get("leagues").split(",")
                     if leaguename in Leagues.keys()]
        if leaguenames==[]:
            leaguenames=Leagues.keys()
        [taskqueue.add(url="/tasks/curation/outright_payoffs/map",
                       params={"league": leaguename},
                       queue_name=QueueName)
         for leaguename in leaguenames]
        logging.info("%s map tasks added" % len(leaguenames))
        taskqueue.add(url="/tasks/curation/outright_payoffs/reduce",
                      params={"leagues": ",".join(leaguenames)},
                      queue_name=QueueName)
        logging.info("Reduce task added")

class MapHandler(webapp2.RequestHandler):

    @validate_query({"league": "\\D{3}\\.\\d"})
    @task
    def post(self):
        leaguename=self.request.get("league")
        items=SingleTeamOutrightBet.filter_atm_payoffs(leaguename)
        keyname="bets/outright_payoffs/%s" % leaguename
        memcache.set(keyname, json_dumps(items), MemcacheAge)
        logging.info("Filtered %i %s outright payoffs" % (len(items), keyname))

class ReduceHandler(webapp2.RequestHandler):

    @validate_query({"leagues": "(\\D{3}\\.\\d\\,)*(\\D{3}\\.\\d)"})
    @task
    def post(self):
        leaguenames=self.request.get("leagues").split(",")
        items=[]
        for leaguename in leaguenames:
            keyname="bets/outright_payoffs/%s" % leaguename
            resp=memcache.get(keyname)
            if resp in ['', None, []]:
                continue
            items+=json_loads(resp)
        logging.info("Total %i outright payoffs" % len(items))
        Blob(key_name="bets/outright_payoffs",
             text=json_dumps(items),
             timestamp=datetime.datetime.now()).put()
        logging.info("Saved to /bets/outright_payoffs")
                
Routing=[('/tasks/curation/outright_payoffs/reduce', ReduceHandler),
         ('/tasks/curation/outright_payoffs/map', MapHandler),
         ('/tasks/curation/outright_payoffs', IndexHandler)]

app=webapp2.WSGIApplication(Routing)


