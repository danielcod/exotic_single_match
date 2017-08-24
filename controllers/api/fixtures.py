from controllers.api import *

# curl "http://localhost:8080/api/fixtures"

class IndexHandler(webapp2.RequestHandler):

    @emit_json
    def get(self):
        cutoff=datetime.datetime.utcnow()
        fixtures=[fixture for fixture in load_fixtures()
                  if fixture["kickoff"] > cutoff]
        for match in fixtures:
            match.pop("dc_grid")
        return fixtures
        
Routing=[('/api/fixtures', IndexHandler)]

app=webapp2.WSGIApplication(Routing)

