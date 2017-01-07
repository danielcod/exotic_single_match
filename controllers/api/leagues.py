from controllers.api import *

Leagues=yaml.load(file("config/leagues.yaml").read())

# curl "http://localhost:8080/api/leagues"

class IndexHandler(webapp2.RequestHandler):
    
    @emit_json_memcache(60)
    def get(self):
        return Leagues

Routing=[('/api/leagues', IndexHandler)]

app=webapp2.WSGIApplication(Routing)
