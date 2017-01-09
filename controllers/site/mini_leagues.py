from controllers.site import *

class PayoffHandler(webapp2.RequestHandler):

    @validate_query({'league': '\\D{3}\\.\\d'})
    @emit_json
    def get(self):
        leaguename=self.request.get("league") # ignored
        return [{"name": name}
                for name in ["Winner", "Bottom"]]

class IndexHandler(webapp2.RequestHandler):

    def get(self):
        render_template(self, "templates/site/mini_leagues.html", {})

Routing=[('/site/mini_leagues/payoff', PayoffHandler),
         ('/site/mini_leagues', IndexHandler)]

app=webapp2.WSGIApplication(Routing)

