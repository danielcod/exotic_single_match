from controllers.site import *

class IndexHandler(webapp2.RequestHandler):

    def get(self):
        depsstr=",".join(["\"../%s\"" % dep
                          for dep in RootDeps])
        contracts=Contract.find_all()
        contracts=contracts[:5] # TEMP
        tv={"title": Title,
            "contracts": contracts,
            "deps": depsstr}
        render_template(self, "templates/site/stage_one.html", tv)

Routing=[('/site/stage_one', IndexHandler)]

app=webapp2.WSGIApplication(Routing)

