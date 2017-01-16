from controllers.site import *

AppDeps=yaml.load("""
- js/app/services.js
- js/app/components.js
- js/app/products/single_teams.js
- js/app/product_betslip.js
- js/app/app.js
""")

ProductConfig=yaml.load("""
- label: Single Teams Outright
  name: single_teams
  description: An outright bet on a single team, but with dozens of payoffs per team - plus you don't have to wait until the end of the season!
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
        # productid=self.request.get("product_id")
        contracts=Contract.find_all()
        if contracts==[]:
            raise RuntimeError("No contracts found")
        productid=contracts[0].key().id()
        depsstr=",".join(["\"../%s\"" % dep
                          for dep in RootDeps+AppDeps])
        tv={"title": Title,
            "deps": depsstr,
            "product_id": productid}
        render_template(self, "templates/site/app.html", tv)

Routing=[('/site/app/init', InitHandler),
         ('/site/app', IndexHandler)]

app=webapp2.WSGIApplication(Routing)

