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
        
    @validate_query({'seed': '^\\d+$',
                     'group': '.+'})
    @emit_json_memcache(MemcacheAge)
    def get(self):
        seed=int(self.request.get("seed"))
        import random
        random.seed(seed) # NB
        products=self.load_products()
        if products==[]:
            raise RuntimeError("No products found")
        index=list(set([int(random.random()*len(products))
                        for i in range(50)]))
        return [products[i]
                for i in index]

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

Routing=[('/app/products/browse', IndexHandler),
         ('/app/products/show', ShowHandler),
         ('/app/products/price', PriceHandler)]

app=webapp2.WSGIApplication(Routing)

