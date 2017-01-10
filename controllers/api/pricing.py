from controllers.api import *

from products.positions.single_teams import SingleTeamsProduct
from products.positions.mini_leagues import MiniLeaguesProduct

Products={
    "single_teams": SingleTeamsProduct,
    "mini_leagues": MiniLeaguesProduct
}

MaxProb, MinProb, MinPrice, MaxPrice = 0.99, 0.01, 1.001, 100

def format_price(probability):
    if probability < MinProb:
        price=MaxPrice
    elif probability > MaxProb:
        price=MinPrice
    else:
        price=1/float(probability)
    if price < 2:
        return "%.3f" % price
    elif price < 5:
        return "%.2f" % price
    else:
        return "%.1f" % price

class IndexHandler(webapp2.RequestHandler):

    @parse_json_body
    @emit_json
    def post(self, struct):
        productname, query = struct["product"], struct["query"]
        if productname not in Products:
            raise RuntimeError("Product not found")
        product=Products[productname]()
        product.validate_query(query)
        contract=product.init_contract(query)
        probability=product.price_contract(contract)
        return {"decimal_price": format_price(probability)}

Routing=[('/api/pricing', IndexHandler)]

app=webapp2.WSGIApplication(Routing)

