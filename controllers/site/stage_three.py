from controllers.site import *

class IndexHandler(webapp2.RequestHandler):

    def get(self):
        depsstr=",".join(["\"../%s\"" % dep
                          for dep in RootDeps])
        tv={"title": Title,
            "deps": depsstr}
        render_template(self, "templates/site/stage_three.html", tv)

Routing=[('/site/stage_three', IndexHandler)]

app=webapp2.WSGIApplication(Routing)
