from controllers.site import *

class IndexHandler(webapp2.RequestHandler):

    def get(self):
        depsstr=",".join(["\"../%s\"" % dep
                         for dep in Deps])
        tv={"title": Title,
            "deps": depsstr}
        render_template(self, "templates/site/single_teams.html", tv)

Routing=[('/site/single_teams', IndexHandler)]

app=webapp2.WSGIApplication(Routing)

