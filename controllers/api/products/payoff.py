from controllers.api.products import *

class IndexHandler(webapp2.RequestHandler):

    @validate_query({'league': '\\D{3}\\.\\d'})
    @emit_json_memcache(60)
    def get(self):
        productname=self.request.get("product")
        leaguename=self.request.get("league")
        if productname not in Products:
            raise RuntimeError("Product not found")
        product=Products[productname]()
        payoffs=[{"value": name}
                 for name in product.payoff_names(leaguename)]
        return payoffs

Routing=[('/api/products/payoff', IndexHandler)]

app=webapp2.WSGIApplication(Routing)

