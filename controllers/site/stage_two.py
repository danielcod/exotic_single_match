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

SampleProduct=yaml.load("""
id: 0
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
        productid=int(self.request.get("product_id"))
        contract=Contract.get_by_id(productid)
        if not contract:
            raise RuntimeError("Contract not found")
        product={"type": contract.product,
                 "query": json_loads(contract.query)}
        return {"products": ProductConfig,
                "product": product}

class IndexHandler(webapp2.RequestHandler):

    def get(self):
        productid=self.request.get("product_id")
        depsstr=",".join(["\"../%s\"" % dep
                          for dep in RootDeps+ProductDeps])
        tv={"title": Title,
            "deps": depsstr,
            "product_id": productid}
        render_template(self, "templates/site/stage_two.html", tv)

Routing=[('/site/stage_two/init', InitHandler),
         ('/site/stage_two', IndexHandler)]

app=webapp2.WSGIApplication(Routing)

