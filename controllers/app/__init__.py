from controllers import *

import apis.yc_lite_api as yc_lite

Deps=yaml.load("""
- css/app/theme.min.css
- css/app/exotics_engine.css
- js/lib/jquery.min.js
- js/lib/bootstrap.min.js
- js/lib/react.min.js
- js/lib/react-dom.min.js
- js/app/services.js
- js/app/components.js
- js/app/products/single_team_outrights.js
- js/app/products/season_match_bets.js
- js/app/pages/page_one.js
- js/app/pages/page_two.js
- js/app/pages/page_three.js
- js/app/app.js
""")

Leagues=yaml.load(file("config/leagues.yaml").read())

class IndexHandler(webapp2.RequestHandler):

    def get(self):
        depsstr=",".join(["\"../%s\"" % dep
                          for dep in Deps])
        tv={"deps": depsstr}
        render_template(self, "templates/app.html", tv)
    
Routing=[('/app', IndexHandler)]

app=webapp2.WSGIApplication(Routing)

