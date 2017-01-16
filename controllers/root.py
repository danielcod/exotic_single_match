from controllers import *

class IndexHandler(webapp2.RequestHandler):

    def get(self):
        self.redirect("/site/app")

Routing=[('/', IndexHandler)]

app=webapp2.WSGIApplication(Routing)

