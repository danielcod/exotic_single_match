from controllers.api import *

Leagues=yaml.load(file("config/leagues.yaml").read())

DefaultLeagueName="GER.1"

# curl "http://localhost:8080/api/leagues"

class IndexHandler(webapp2.RequestHandler):
    
    @emit_json_memcache(60)
    def get(self):
        leagues=list(Leagues)
        for league in leagues:
            if league["name"]==DefaultLeagueName:
                league["selected"]=True
        return leagues

Routing=[('/api/leagues', IndexHandler)]

app=webapp2.WSGIApplication(Routing)
