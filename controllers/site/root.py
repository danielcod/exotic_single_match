from controllers.site import *

class IndexHandler(webapp2.RequestHandler):

    def get(self):
        self.redirect("/site/single_teams")

Routing=[('/.*', IndexHandler)]

app=webapp2.WSGIApplication(Routing)

