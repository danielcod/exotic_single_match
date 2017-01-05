from controllers.api import *

# curl "http://localhost:8080/api/leagues"

class IndexHandler(webapp2.RequestHandler):
    
    @emit_json
    def get(self):
        return [{"name": league["name"]}
                for league in yaml.load(file("config/bbc.yaml").read())]

Routing=[('/api/leagues', IndexHandler)]

app=webapp2.WSGIApplication(Routing)
