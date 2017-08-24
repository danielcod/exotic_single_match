from controllers.api import *

# curl "http://localhost:8080/api/matches"

class IndexHandler(webapp2.RequestHandler):

    @emit_json_memcache(MemcacheAge)
    def get(self):
        matches=Blob.fetch("matches")
        for match in matches:
            match.pop("dc_grid")
        return matches
        
Routing=[('/api/matches', IndexHandler)]

app=webapp2.WSGIApplication(Routing)

