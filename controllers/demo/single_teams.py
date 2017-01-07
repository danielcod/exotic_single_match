from controllers.demo import *

class IndexHandler(webapp2.RequestHandler):

    def get(self):
        render_template(self, "templates/demo/single_teams.html", {})

Routing=[('/demo/single_teams', IndexHandler)]

app=webapp2.WSGIApplication(Routing)

