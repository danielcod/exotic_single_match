from controllers import *

class IndexHandler(webapp2.RequestHandler):

    def get(self):
        self.redirect("/site/stage_two")

Routing=[('/', IndexHandler)]

app=webapp2.WSGIApplication(Routing)

