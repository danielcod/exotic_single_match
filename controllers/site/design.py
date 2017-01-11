from controllers.site import *

Products=yaml.load("""
- label: Single Teams Outright
  name: single_teams
- label: Mini Leagues
  name: mini_leagues
""")

DesignDeps=RootDeps+["js/app/design.js"]

DefaultProductId=0

SampleProducts=yaml.load("""
- id: 0
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

    @validate_query({'product_id': '^\\d+$'})
    @emit_json    
    def get(self):
        productid=self.request.get("product_id")
        products=dict([(str(product["id"]), product)
                       for product in SampleProducts])
        if productid not in products:
            raise RuntimeError("Product not found")
        product=products[productid]        
        return {"products": Products,
                "product": product}

class IndexHandler(webapp2.RequestHandler):
    
    def get(self):
        productid=self.request.get("product_id")
        if productid in ['', None, []]:
            productid=DefaultProductId
        else:
            productid=int(productid)
        depsstr=",".join(["\"../%s\"" % dep
                          for dep in DesignDeps])
        tv={"title": Title,
            "deps": depsstr,
            "product_id": productid}
        render_template(self, "templates/site/design.html", tv)

Routing=[('/site/design/leagues', LeaguesHandler),
         ('/site/design/init', InitHandler),
         ('/site/design', IndexHandler)]

app=webapp2.WSGIApplication(Routing)
