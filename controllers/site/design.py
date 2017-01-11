from controllers.site import *

Products=yaml.load("""
- label: Single Teams Outright
  name: single_teams
  description: How Now Brown Cow
- label: Mini Leagues
  name: mini_leagues
  description: A Bird In the Hand 
""")

class ProductsHandler(webapp2.RequestHandler):

    @emit_json
    def get(self):
        return Products

class IndexHandler(webapp2.RequestHandler):
    
    def get(self):
        depsstr=",".join(["\"../%s\"" % dep
                         for dep in Deps])
        tv={"title": Title,
            "deps": depsstr}
        render_template(self, "templates/site/design.html", tv)

        
Routing=[('/site/design/products', ProductsHandler),
         ('/site/design', IndexHandler)]

app=webapp2.WSGIApplication(Routing)

