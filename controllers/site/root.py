from controllers.site import *

class IndexHandler(webapp2.RequestHandler):

    def get(self):
        tv={"message": "Hello World!"}
        render_template(self, "templates/hello.html", tv)

Routing=[('/.*', IndexHandler)]

app=webapp2.WSGIApplication(Routing)

