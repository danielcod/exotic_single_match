from controllers.app import *

class PriceHandler(webapp2.RequestHandler):

    @parse_json_body
    # @emit_json_memcache(MemcacheAge)
    @emit_json
    def post(self, bet):
        type, params = bet.pop("type"), bet["params"]
        products=dict([(product["type"], product["pkg"])
                       for product in Products])
        if type not in products:
            raise RuntimeError("Product not found")
        try:
            mod=__import__(products[type], fromlist=[""])
        except ImportError:
            raise RuntimeError("Error importing %s" % products[type])
        return {"probability": mod.calc_probability(params),
                "description": mod.description(params)}

Routing=[('/app/bets/price', PriceHandler)]

app=webapp2.WSGIApplication(Routing)

