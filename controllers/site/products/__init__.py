from controllers.site import *

Deps=RootDeps+["js/app/products.js"]

Products=yaml.load("""
- label: Single Teams Outright
  name: single_teams
- label: Mini Leagues
  name: mini_leagues
""")

DefaultProductId=0

SampleProducts=yaml.load("""
- id: 0
  type: single_teams
  query:
    league: SPA.1
    team: Barcelona
    payoff: Winner
    expiry: "2017-07-01"
""")

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
                          for dep in Deps])
        tv={"title": Title,
            "deps": depsstr,
            "product_id": productid}
        render_template(self, "templates/site/products.html", tv)

Routing=[('/site/products/init', InitHandler),
         ('/site/products', IndexHandler)]

app=webapp2.WSGIApplication(Routing)

