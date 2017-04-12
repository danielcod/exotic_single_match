from controllers.app import *

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

class PriceHandler(webapp2.RequestHandler):

    @parse_json_body
    # @emit_json_memcache(MemcacheAge)
    @emit_json
    def post(self, struct):
        bettype=struct.pop("type")
        products=dict([(product["type"], product["pkg"])
                       for product in Products])
        if bettype not in products:
            raise RuntimeError("Product not found")
        try:
            mod=__import__(products[bettype], fromlist=[""])
        except ImportError:
            raise RuntimeError("Error importing %s" % products[bettype])
        return {"price": format_price(mod.calc_probability(struct)),
                "description": mod.description(struct)}

Routing=[('/app/bets/price', PriceHandler)]

app=webapp2.WSGIApplication(Routing)

