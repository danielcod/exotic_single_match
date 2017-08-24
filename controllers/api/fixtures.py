from controllers.api import *

# curl "http://localhost:8080/api/fixtures"

class IndexHandler(webapp2.RequestHandler):

    @emit_json_memcache(MemcacheAge)
    def get(self):
        fixtures=load_fixtures()
        for match in fixtures:
            match.pop("dc_grid")
        return fixtures
        
Routing=[('/api/fixtures', IndexHandler)]

app=webapp2.WSGIApplication(Routing)

