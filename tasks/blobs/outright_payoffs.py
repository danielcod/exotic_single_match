from tasks.blobs import *

from models.bets.positions.single_team_outrights import SingleTeamOutrightBet

# curl "http://localhost:8080/tasks/blobs/outright_payoffs?leagues=ENG.1"

class IndexHandler(webapp2.RequestHandler):

    @task
    def get(self):         
        leaguenames=[leaguename 
                     for leaguename in self.request.get("leagues").split(",")
                     if leaguename in Leagues.keys()]
        if leaguenames==[]:
            leaguenames=Leagues.keys()
        [taskqueue.add(url="/tasks/blobs/outright_payoffs/map",
                       params={"league": leaguename},
                       queue_name=QueueName)
         for leaguename in leaguenames]
        logging.info("%s map tasks added" % len(leaguenames))
        taskqueue.add(url="/tasks/blobs/outright_payoffs/reduce",
                      params={"leagues": ",".join(leaguenames)},
                      queue_name=QueueName)
        logging.info("Reduce task added")

class MapHandler(webapp2.RequestHandler):

    @validate_query({"league": "\\D{3}\\.\\d"})
    @task
    def post(self):
        leaguename=self.request.get("league")
        items=SingleTeamOutrightBet.filter_atm_payoffs(leaguename)
        keyname="outright_payoffs/%s" % leaguename
        memcache.add(keyname, json_dumps(items), MemcacheAge)
        logging.info("Save %s blob [%i items]" % (keyname, len(items)))

class ReduceHandler(webapp2.RequestHandler):

    @validate_query({"leagues": "(\\D{3}\\.\\d\\,)*(\\D{3}\\.\\d)"})
    @task
    def post(self):
        leaguenames=self.request.get("leagues").split(",")
        items=[]
        for leaguename in leaguenames:
            keyname="outright_payoffs/%s" % leaguename
            resp=memcache.get(keyname)
            if resp in ['', None, []]:
                continue
            items+=json_loads(resp)
        logging.info("%i outright payoffs found" % len(items))
        Blob(key_name="outright_payoffs",
             text=json_dumps(items),
             timestamp=datetime.datetime.now()).put()
        logging.info("Saved to /outright_payoffs")
                
Routing=[('/tasks/blobs/outright_payoffs/reduce', ReduceHandler),
         ('/tasks/blobs/outright_payoffs/map', MapHandler),
         ('/tasks/blobs/outright_payoffs', IndexHandler)]

app=webapp2.WSGIApplication(Routing)


