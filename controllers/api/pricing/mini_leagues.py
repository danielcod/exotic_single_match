from controllers.api.pricing import *

from products.positions.mini_leagues import MiniLeaguesProduct

# curl "http://localhost:8080/api/pricing/mini_leagues/payoff"

class PayoffHandler(webapp2.RequestHandler):

    @emit_json
    def get(self):
        return [{"name": name}
                for name in ["Winner", "Bottom"]]

# curl -X POST "http://localhost:8080/api/pricing/mini_leagues/price" -d "{\"product\": \"mini_leagues\", \"query\": {\"teams\": [{\"league\": \"ENG.1\", \"name\": \"Arsenal\", \"selected\": true}, {\"league\": \"SPA.1\", \"name\": \"Celta Vigo\"}, {\"league\": \"GER.1\", \"name\": \"Borussia Dortmund\"}], \"payoff\": \"Winner\", \"expiry\": \"2017-03-01\"}}"

class PriceHandler(webapp2.RequestHandler):

    @parse_json_body
    @emit_json
    def post(self, struct):
        query=struct["query"]
        product=MiniLeaguesProduct()
        product.validate_query(query)
        contract=product.init_contract(query)
        probability=product.price_contract(contract)
        return {"decimal_price": format_price(probability)}
        
Routing=[('/api/pricing/mini_leagues/payoff', PayoffHandler),
         ('/api/pricing/mini_leagues/price', PriceHandler)]

app=webapp2.WSGIApplication(Routing)
