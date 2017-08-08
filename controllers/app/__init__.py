from controllers import *

Leagues = yaml.load(file("config/leagues.yaml").read())

Deps = yaml.load(file("config/app_deps.yaml").read())

class IndexHandler(webapp2.RequestHandler):

    def get(self):
        try:
            depsstr = ",".join(["\"../%s\"" % dep for dep in Deps])
            tv = {"deps": depsstr}
            render_template(self, "templates/app.html", tv)
        except RuntimeError, error:
            render_error(self, str(error))
    
Routing = [('/app', IndexHandler)]

app = webapp2.WSGIApplication(Routing)

