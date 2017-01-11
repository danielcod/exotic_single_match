from controllers.site import *

Products=yaml.load("""
- label: Single Teams Outright
  name: single_teams
  description: How Now Brown Cow
- label: Mini Leagues
  name: mini_leagues
  description: A Bird In the Hand 
""")

class IndexHandler(webapp2.RequestHandler):
    
    def serve_json(self):
        struct=Products
        render_json(self, struct)

    def serve_template(self):
        depsstr=",".join(["\"../%s\"" % dep
                         for dep in Deps])
        tv={"title": Title,
            "deps": depsstr}
        render_template(self, "templates/site/products.html", tv)
    
    def get(self):
        if "application/json" in self.request.headers["Accept"]:
            self.serve_json()
        else:
            self.serve_template()


Routing=[('/site/products', IndexHandler)]

app=webapp2.WSGIApplication(Routing)

