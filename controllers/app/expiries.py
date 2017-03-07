from controllers.app import *

# curl "http://localhost:8080/app/expiries"
    
class IndexHandler(webapp2.RequestHandler):
    
    @emit_json_memcache(MemcacheAge)
    def get(self, cutoffmonth=4):
        return init_expiries(cutoffmonth)

Routing=[('/app/expiries', IndexHandler)]

app=webapp2.WSGIApplication(Routing)
