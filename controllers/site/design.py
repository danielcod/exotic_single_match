from controllers.site import *

Products=yaml.load("""
- label: Single Teams Outright
  name: single_teams
  description: How Now Brown Cow
- label: Mini Leagues
  name: mini_leagues
  description: A Bird In the Hand 
""")

DesignDeps=Deps+["js/app/design.js"]

class InitHandler(webapp2.RequestHandler):

    @emit_json
    def get(self):
        return {"products": Products}

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

