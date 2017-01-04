from controllers.demo import *

class IndexHandler(webapp2.RequestHandler):

    def get(self):
        render_template(self, "templates/demo/hello.html", {})

Routing=[('/.*', IndexHandler)]

app=webapp2.WSGIApplication(Routing)

