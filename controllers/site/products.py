from controllers.site import *

Products=yaml.load("""
- label: Single Teams Outright
  name: single_teams
  description: How Now Brown Cow
- label: Mini Leagues
  name: mini_leagues
  description: A Bird In the Hand 
""")

class InitHandler(webapp2.RequestHandler):

    @emit_json
    def get(self):
        return {"products": Products,
                # "bet_type": "single_teams",
                "bet_type": "single_teams",
                "bet_query": {"league": "ENG.1",
                              "team": "Arsenal",
                              "payoff": "Winner"}}

class IndexHandler(webapp2.RequestHandler):

    def get(self):
        depsstr=",".join(["\"../%s\"" % dep
                         for dep in Deps])
        tv={"title": Title,
            "deps": depsstr}
        render_template(self, "templates/site/products.html", tv)

Routing=[('/site/products/init', InitHandler),
         ('/site/products', IndexHandler)]

app=webapp2.WSGIApplication(Routing)

