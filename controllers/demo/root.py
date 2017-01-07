from controllers.demo import *

class IndexHandler(webapp2.RequestHandler):

    def get(self):
        self.redirect("/demo/single_teams")

Routing=[('/.*', IndexHandler)]

app=webapp2.WSGIApplication(Routing)

