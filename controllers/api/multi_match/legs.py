from controllers.api.multi_match import *

# curl "http://localhost:8080/api/single_match/legs"

class IndexHandler(webapp2.RequestHandler):

    # @emit_json_memcache(MemcacheAge)
    # @add_cors_headers
    @emit_json
    def get(self):
        cutoff=datetime.datetime.utcnow()
        fixtures=[fixture for fixture in load_fixtures()
                  if fixture["kickoff"] > cutoff]
        for fixture in fixtures:
            for attr in ["1x2_prices", "dc_grid"]:
                fixture.pop(attr)
        return fixtures

Routing=[('/api/single_match/legs', IndexHandler)]

app=webapp2.WSGIApplication(Routing)

