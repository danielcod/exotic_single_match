from controllers.site import *

ProductDeps=yaml.load("""
- js/app/services.js
- js/app/components.js
- js/app/single_teams.js
- js/app/products.js
""")

ProductConfig=yaml.load("""
- label: Single Teams Outright
  name: single_teams
  description: An outright bet on a single team, but with dozens of payoffs per team - plus you don't have to wait until the end of the season!
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
    @emit_json_memcache(60)    
    def get(self):
        productid=self.request.get("product_id")
        products=dict([(str(product["id"]), product)
                       for product in SampleProducts])
        if productid not in products:
            raise RuntimeError("Product not found")
        product=products[productid]        
        return {"products": ProductConfig,
                "product": product}

class IndexHandler(webapp2.RequestHandler):

    def get(self):
        productid=self.request.get("product_id")
        if productid in ['', None, []]:
            productid=DefaultProductId
        else:
            productid=int(productid)
        depsstr=",".join(["\"../%s\"" % dep
                          for dep in RootDeps+ProductDeps])
        tv={"title": Title,
            "deps": depsstr,
            "product_id": productid}
        render_template(self, "templates/site/products.html", tv)

Routing=[('/site/products/init', InitHandler),
         ('/site/products', IndexHandler)]

app=webapp2.WSGIApplication(Routing)

