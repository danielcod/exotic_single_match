from controllers.site import *

Products=yaml.load("""
- label: Single Teams Outright
  name: single_teams
- label: Mini Leagues
  name: mini_leagues
""")

DesignDeps=Deps+["js/app/design.js"]

DefaultProduct=yaml.load("""
type: single_teams
query:
  league: ENG.1
  team: Arsenal
  payoff: Winner
""")

class InitHandler(webapp2.RequestHandler):

    @emit_json
    def get(self):
        return {"products": Products,
                "product": DefaultProduct}

class IndexHandler(webapp2.RequestHandler):
    
    def get(self):        
        depsstr=",".join(["\"../%s\"" % dep
                          for dep in DesignDeps])
        tv={"title": Title,
            "deps": depsstr}
        render_template(self, "templates/site/design.html", tv)
        
Routing=[('/site/design/init', InitHandler),
         ('/site/design', IndexHandler)]

app=webapp2.WSGIApplication(Routing)

