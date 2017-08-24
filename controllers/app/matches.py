from controllers.app import *

# curl "http://localhost:8080/app/matches"

class IndexHandler(webapp2.RequestHandler):

    @emit_json_memcache(MemcacheAge)
    def get(self):
        matches=Blob.fetch("matches")
        for match in matches:
            match.pop("dc_grid")
        return matches
        
Routing=[('/app/matches', IndexHandler)]

app=webapp2.WSGIApplication(Routing)

