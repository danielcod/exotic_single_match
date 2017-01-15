from controllers.api.products import *

class IndexHandler(webapp2.RequestHandler):

    @validate_query({'league': '\\D{3}\\.\\d',
                     'team': '.*'})
    @emit_json_memcache(60)
    def get(self):
        productname=self.request.get("product")
        leaguename=self.request.get("league")
        teamname=self.request.get("team")
        if teamname in ['', []]:
            teamname=None
        if productname not in Products:
            raise RuntimeError("Product not found")
        product=Products[productname]()
        payoffs=[{"value": payoff["name"],
                  "probability": payoff["value"]}
                 for payoff in product.init_payoffs(leaguename, teamname)]
        return payoffs

Routing=[('/api/products/payoffs', IndexHandler)]

app=webapp2.WSGIApplication(Routing)

