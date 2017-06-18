from tasks.app import *

from quant.dixon_coles import CSGrid

# curl "http://localhost:8080/tasks/app/matches?window=30"

class IndexHandler(webapp2.RequestHandler):

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

def normalise_1x2_prices(prices):
    probs=[1/float(price)
           for price in prices]
    overround=sum(probs)
    normprobs=[prob/float(overround)
               for prob in probs]
    return [1/float(prob)
            for prob in normprobs]

"""
- NB not spawning one task per DC calculation because
  - DC calculation is relatively fast
  - finite number of matches per league assuming window is < 30 days
- should really do rho calculation but O/U 2.5 prices not currently available via Elisey API
"""

class MapHandler(webapp2.RequestHandler):

    @validate_query({"league": "^\\D{3}\\.\\d$",
                     "window": "^\\d+$"})
    @task
    def post(self):
        leaguename=self.request.get("league")
        window=int(self.request.get("window"))
        cutoff=datetime.date.today()+datetime.timedelta(days=window)
        matches=sorted([{"league": leaguename,
                       "name": match["name"],
                       "kickoff": match["kickoff"],
                       "1x2_prices": normalise_1x2_prices(filter_best_1x2_prices(match["pre_event_1x2_prices"]))}
                      for match in ebadi.get_remaining_fixtures(leaguename,
                                                                Leagues[leaguename]["season"])
                      if ("kickoff" in match and
                          match["kickoff"] not in [[], None] and
                          match["kickoff"].date() <= cutoff and
                          "pre_event_1x2_prices" in match and
                          match["pre_event_1x2_prices"] not in [[], None])],
                     key=lambda x: "%s/%s" % (x["kickoff"], x["name"]))
        formatstr="%s/%s :: lx -> %.5f, ly -> %.5f, err -> %.5f"
        for match in matches:
            probs=[1/float(price)
                   for price in match["1x2_prices"]]
            lx, ly, err = CSGrid.solve(probs)
            logging.info(formatstr % (match["league"],
                                      match["name"],
                                      lx, ly, err))
            match["dc_grid"]=CSGrid.from_poisson(lx, ly)
        keyname="matches/%s" % leaguename
        memcache.set(keyname, json_dumps(matches), MemcacheAge)
        logging.info("Filtered %i %s matches" % (len(matches), keyname))

class ReduceHandler(webapp2.RequestHandler):

    @validate_query({"leagues": "(\\D{3}\\.\\d\\,)*(\\D{3}\\.\\d)"})
    @task
    def post(self):
        leaguenames=self.request.get("leagues").split(",")
        matches=[]
        for leaguename in leaguenames:
            keyname="matches/%s" % leaguename
            resp=memcache.get(keyname)
            if resp in ['', None, []]:
                continue
            matches+=json_loads(resp)
        logging.info("Total %i matches" % len(matches))
        Blob(key_name="app/matches",
             text=json_dumps(matches),
             timestamp=datetime.datetime.now()).put()
        logging.info("Saved to /matches")
                
Routing=[('/tasks/app/matches/reduce', ReduceHandler),
         ('/tasks/app/matches/map', MapHandler),
         ('/tasks/app/matches', IndexHandler)]

app=webapp2.WSGIApplication(Routing)


