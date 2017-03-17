from controllers import *

import apis.yc_lite_api as yc_lite

Deps=yaml.load(file("config/app_deps.yaml").read())

Products=yaml.load(file("config/products.yaml").read())

Leagues=yaml.load(file("config/leagues.yaml").read())

class IndexHandler(webapp2.RequestHandler):

    def get(self):
        depsstr=",".join(["\"../%s\"" % dep
                          for dep in Deps])
        tv={"deps": depsstr}
        render_template(self, "templates/app.html", tv)
    
Routing=[('/app', IndexHandler)]

app=webapp2.WSGIApplication(Routing)

