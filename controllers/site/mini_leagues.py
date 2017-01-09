from controllers.site import *

class IndexHandler(webapp2.RequestHandler):

    def get(self):
        render_template(self, "templates/site/mini_leagues.html", {})

Routing=[('/site/mini_leagues', IndexHandler)]

app=webapp2.WSGIApplication(Routing)

