from controllers import *

import apis.yc_lite_api as yc_lite

Products=yaml.load(file("config/products.yaml").read())

Leagues=yaml.load(file("config/leagues.yaml").read())

Dev, Prod = "dev", "prod"

DefaultMode=Prod

class IndexHandler(webapp2.RequestHandler):

    def get(self):
        try:
            mode=self.request.get("mode")
            if mode in ["", None]:
                mode=DefaultMode
            if mode not in [Dev, Prod]:
                raise RuntimeError("Mode not recognised")
            deps=yaml.load(file("config/app_deps_%s.yaml" % mode).read())
            depsstr=",".join(["\"../%s\"" % dep
                              for dep in deps])
            tv={"deps": depsstr}
            render_template(self, "templates/app.html", tv)
        except RuntimeError, error:
            render_error(self, str(error))
    
Routing=[('/app', IndexHandler)]

app=webapp2.WSGIApplication(Routing)

