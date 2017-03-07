from controllers.app import *

# curl http://localhost:8080/app/leagues

class IndexHandler(webapp2.RequestHandler):

    @emit_json_memcache(MemcacheAge)
    def get(self):
        return Leagues

Routing=[('/app/leagues', IndexHandler)]

app=webapp2.WSGIApplication(Routing)

