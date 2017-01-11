from controllers.site import *

class IndexHandler(webapp2.RequestHandler):

    def get(self):
        depsstr=",".join(["\"../%s\"" % dep
                         for dep in Deps])
        tv={"title": Title,
            "deps": depsstr}
        render_template(self, "templates/site/products.html", tv)

Routing=[('/site/products', IndexHandler)]

app=webapp2.WSGIApplication(Routing)

