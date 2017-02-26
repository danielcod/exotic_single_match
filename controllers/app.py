from controllers import *

import apis.yc_lite_api as yc_lite

from helpers.expiry_helpers import init_expiries
from helpers.price_helpers import format_price

from models.products.positions.single_team_outrights import SingleTeamOutrightProduct
from models.products.positions.season_match_bets import SeasonMatchBetProduct

import random

Deps=yaml.load("""
- css/app/theme.min.css
- js/lib/jquery.min.js
- js/lib/bootstrap.min.js
- js/lib/react.min.js
- js/lib/react-dom.min.js
- js/app/services.js
- js/app/components.js
- js/app/products/single_team_outrights.js
- js/app/products/season_match_bets.js
- js/app/steps/step_one.js
- js/app/steps/step_two.js
- js/app/steps/step_three.js
- js/app/app.js
""")

ProductTypes=yaml.load(file("config/product_types.yaml").read())

ProductMapping={
    "single_team_outright": SingleTeamOutrightProduct,
    "season_match_bet": SeasonMatchBetProduct
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

    def load_single_team_outrights(self):
        return [{"type": "single_team_outright",
                 "params": {"description": product.description,
                            "price": product.price,
                            "id": product.key().id()}}
                for product in SingleTeamOutrightProduct.find_all()]

    def load_season_match_bets(self):
        return [{"type": "season_match_bet",
                 "params": {"description": product.description,
                            "price": product.price,
                            "id": product.key().id()}}
                for product in SeasonMatchBetProduct.find_all()]

    def load_products_db(self):
        products=[]
        products+=self.load_single_team_outrights()
        products+=self.load_season_match_bets()
        return products

    def load_products_memcache(self):
        resp=memcache.get("products")
        if resp in ['', None, []]:
            return None
        return json_loads(resp)

    def save_products_memcache(self, products, age=60):
        memcache.set("products", json_dumps(products), age)
    
    def load_products(self):
        products=self.load_products_memcache()
        if products!=None:
            logging.info("Serving products from memcache")
            return products
        logging.info("Loading products from DB")
        products=self.load_products_db()
        self.save_products_memcache(products)
        return products
        
    @validate_query({'seed': '^\\d+$',
                     'group': '.+'})
    @emit_json
    def get(self):
        seed=int(self.request.get("seed"))
        random.seed(seed) # NB
        products=self.load_products()
        if products==[]:
            raise RuntimeError("No products found")
        index=list(set([int(random.random()*len(products))
                        for i in range(50)]))
        return [products[i]
                for i in index]

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
        tv={"deps": depsstr}
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

