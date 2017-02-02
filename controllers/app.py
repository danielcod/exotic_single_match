from controllers import *

import apis.yc_lite_api as yc_lite

from helpers.expiry_helpers import init_expiries
from helpers.price_helpers import format_price

from models.products.positions.single_team_outrights import SingleTeamOutrightProduct

import random

Title="Team Exotics Demo"

Deps=yaml.load("""
- css/app/theme.min.css
- js/lib/jquery.min.js
- js/lib/bootstrap.min.js
- js/lib/react.min.js
- js/lib/react-dom.min.js
- js/app/services.js
- js/app/components.js
- js/app/products/single_team_outright.js
- js/app/steps/step_one.js
- js/app/steps/step_two.js
- js/app/steps/step_three.js
- js/app/app.js
""")

ProductTypes=yaml.load(file("config/product_types.yaml").read())

ProductMapping={
    "single_team_outright": SingleTeamOutrightProduct,
}

Leagues=yaml.load(file("config/leagues.yaml").read())

class LeaguesHandler(webapp2.RequestHandler):

    @emit_json_memcache(60)
    def get(self):
        return [{"value": league["name"]}
                for league in Leagues]
    
class TeamsHandler(webapp2.RequestHandler):

    @validate_query({'league': '^\\D{3}\\.\\d$'})
    @emit_json_memcache(60)
    def get(self):
        leaguename=self.request.get("league")
        leaguenames=[league["name"]
                     for league in Leagues]
        if leaguename not in leaguenames:
            raise RuntimeError("League not found")
        return [{"value": team["name"]}
                for team in yc_lite.get_teams(leaguename)]

class ExpiriesHandler(webapp2.RequestHandler):
    
    @emit_json_memcache(60)
    def get(self, cutoffmonth=4):
        return init_expiries(cutoffmonth)

class ProductTypesHandler(webapp2.RequestHandler):

    @emit_json
    def get(self):
        return ProductTypes
    
class BrowseProductsHandler(webapp2.RequestHandler):

    @validate_query({'seed': '^\\d+$'})
    @emit_json
    def get(self):
        seed=int(self.request.get("seed"))
        products=SingleTeamOutrightProduct.find_all()
        if products==[]:
            raise RuntimeError("No products found")
        products=[{"type": "single_team_outright",
                   "params": {"description": product.description,
                              "price": product.price,
                              "id": product.key().id()}}
                   for product in products]
        random.seed(seed) # NB
        return [products[int(random.random()*len(products))]
                for i in range(50)]

class ShowProductHandler(webapp2.RequestHandler):

    @validate_query({'type': '.+',
                     'id': '^\\d+'})
    @emit_json
    def get(self):
        producttype=self.request.get("type")
        if producttype not in ProductMapping:
            raise RuntimeError("Product not found")
        id=int(self.request.get("id"))
        product=ProductMapping[producttype].get_by_id(id)
        if not product:
            raise RuntimeError("Product not found")
        return {"type": producttype,
                "params": product.to_json(extras=["description"])}

class ProductPayoffsHandler(webapp2.RequestHandler):

    @validate_query({'league': '\\D{3}\\.\\d'})
    @emit_json
    def get(self):
        producttype=self.request.get("type")
        if producttype not in ProductMapping:
            raise RuntimeError("Product not found")
        product=ProductMapping[producttype]()
        leaguename=self.request.get("league")
        payoffs=[{"value": payoff["name"]}
                 for payoff in product.init_payoffs(leaguename)]
        return payoffs

class ProductPriceHandler(webapp2.RequestHandler):

    @parse_json_body
    @emit_json
    def post(self, struct):
        producttype, params = struct["type"], struct["params"]
        if producttype not in ProductMapping:
            raise RuntimeError("Product not found")
        product=ProductMapping[producttype](**params)
        probability=product.calc_probability()
        return {"price": format_price(probability),
                "description": product.description}

class IndexHandler(webapp2.RequestHandler):

    def get(self):
        depsstr=",".join(["\"../%s\"" % dep
                          for dep in Deps])
        tv={"title": Title,
            "deps": depsstr}
        render_template(self, "templates/app.html", tv)
    
Routing=[('/app/leagues', LeaguesHandler),
         ('/app/teams', TeamsHandler),
         ('/app/expiries', ExpiriesHandler),
         ('/app/product_types', ProductTypesHandler),         
         ('/app/products/browse', BrowseProductsHandler),
         ('/app/products/show', ShowProductHandler),
         ('/app/products/payoffs', ProductPayoffsHandler),
         ('/app/products/price', ProductPriceHandler),
         ('/app', IndexHandler)]

app=webapp2.WSGIApplication(Routing)

