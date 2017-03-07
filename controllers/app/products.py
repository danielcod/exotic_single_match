from controllers.app import *

from models.products.positions.single_team_outrights import SingleTeamOutrightProduct
from models.products.positions.season_match_bets import SeasonMatchBetProduct

from helpers.price_helpers import format_price

ProductMapping={
    "single_team_outright": SingleTeamOutrightProduct,
    "season_match_bet": SeasonMatchBetProduct
}

class IndexHandler(webapp2.RequestHandler):

    def load_products_db(self):
        products=[]
        products+=SingleTeamOutrightProduct.find_all()
        products+=SeasonMatchBetProduct.find_all()
        return [product.json_struct
                for product in products]

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
            
    @validate_query({'group': '.+',
                     'team': '.+',
                     'product_type': '.+'})
    @emit_json_memcache(MemcacheAge)
    def get(self):
        groupname=self.request.get("group")
        teamname=self.request.get("team")
        productname=self.request.get("product_type")
        logging.info("Group: %s" % groupname)
        logging.info("Team: %s" % teamname)
        logging.info("Product: %s" % productname)
        return self.load_products()

class ShowHandler(webapp2.RequestHandler):

    @validate_query({'type': '.+',
                     'id': '^\\d+'})
    @emit_json_memcache(MemcacheAge)
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

class PriceHandler(webapp2.RequestHandler):

    @parse_json_body
    # @emit_json_memcache(MemcacheAge)
    @emit_json
    def post(self, struct):
        producttype, params = struct["type"], struct["params"]
        if producttype not in ProductMapping:
            raise RuntimeError("Product not found")
        product=ProductMapping[producttype](**params)
        probability=product.calc_probability()
        return {"price": format_price(probability),
                "description": product.description}

Routing=[('/app/products/show', ShowHandler),
         ('/app/products/price', PriceHandler),
         ('/app/products', IndexHandler)]

app=webapp2.WSGIApplication(Routing)

