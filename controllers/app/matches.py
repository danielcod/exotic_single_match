from controllers.app import *

# curl "http://localhost:8080/app/matches"

class IndexHandler(webapp2.RequestHandler):

    #emit_json_memcache(MemcacheAge)
    @emit_json
    def get(self):
        self.response.headers['Content-Type'] = 'application/json'
        self.response.headers['Access-Control-Allow-Origin'] = '*'
        self.response.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
        self.response.headers['Access-Control-Allow-Methods'] = 'POST, GET, PUT, DELETE'

        matches = Blob.fetch("app/matches")
        for match in matches:
            match.pop("dc_grid")
        return matches

Routing = [('/app/matches', IndexHandler)]

app = webapp2.WSGIApplication(Routing, debug=True)

