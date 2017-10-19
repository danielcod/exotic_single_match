from controllers.api.single_match import *

# curl "http://localhost:8080/api/single_match/legs"

class IndexHandler(webapp2.RequestHandler):

    #@emit_json_memcache(MemcacheAge)
    @add_cors_headers
    @emit_json
    def get(self):
        import urllib
        return json_loads(urllib.urlopen("https://interface-dot-exotic-parameter-predictions.appspot.com/get_games").read())

Routing=[('/api/single_match/legs', IndexHandler)]

app=webapp2.WSGIApplication(Routing)

