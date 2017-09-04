from controllers.api import *

# curl "http://localhost:8080/api/fixtures"

class IndexHandler(webapp2.RequestHandler):

    @emit_json
    def get(self):
        self.response.headers['Content-Type'] = 'application/json'
        self.response.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
        self.response.headers['Access-Control-Allow-Credentials'] = 'true'
        self.response.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
        self.response.headers['Access-Control-Allow-Methods'] = 'POST, GET'
        cutoff=datetime.datetime.utcnow()
        fixtures=[fixture for fixture in load_fixtures()
                  if fixture["kickoff"] > cutoff]
        for match in fixtures:
            match.pop("dc_grid")
        return fixtures
        
Routing=[('/api/fixtures', IndexHandler)]

app=webapp2.WSGIApplication(Routing)

