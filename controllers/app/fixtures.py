from controllers.app import *

# curl "http://localhost:8080/app/fixtures"

class IndexHandler(webapp2.RequestHandler):

    def load_fixtures(self):
        fixtures=[]
        for league in Leagues:
            fixtures+=MemBlob.fetch("fixtures/%s" % league["name"])
        return fixtures
    
    @emit_json_memcache(MemcacheAge)
    def get(self):
        fixtures=self.load_fixtures()
        for match in fixtures:
            match.pop("dc_grid")
        return fixtures
        
Routing=[('/app/fixtures', IndexHandler)]

app=webapp2.WSGIApplication(Routing)

