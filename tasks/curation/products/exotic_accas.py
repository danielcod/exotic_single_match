from tasks.curation.products import *

class IndexHandler(webapp2.RequestHandler):

    @validate_query({'n': '\\d+'})
    @task
    def post(self):
        bets=[]
        keyname="bets/samples/exotic_acca_bet"
        memcache.set(keyname, json_dumps(bets), MemcacheAge)
        logging.info("Saved %i exotic_acca_bet" % len(bets))

Routing=[('/tasks/curation/products/exotic_accas', IndexHandler)]

app=webapp2.WSGIApplication(Routing)
