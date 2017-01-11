from controllers.site import *

Products=yaml.load("""
- label: Single Teams Outright
  name: single_teams
- label: Mini Leagues
  name: mini_leagues
""")

DesignDeps=RootDeps+["js/app/design.js"]

DefaultProduct=yaml.load("""
type: single_teams
query:
  league: SPA.1
  team: Barcelona
  payoff: Winner
""")

class LeaguesHandler(webapp2.RequestHandler):

    @emit_json
    def get(self):
        return [{"value": league["name"]}
                for league in Leagues]

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

Routing=[('/site/design/leagues', LeaguesHandler),
         ('/site/design/init', InitHandler),
         ('/site/design', IndexHandler)]

app=webapp2.WSGIApplication(Routing)

