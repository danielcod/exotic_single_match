from controllers.site import *

class IndexHandler(webapp2.RequestHandler):

    @emit_json_memcache(60)
    def get(self):
        return [{"value": league["name"]}
                for league in Leagues]

Routing=[('/site/leagues', IndexHandler)]

app=webapp2.WSGIApplication(Routing)

