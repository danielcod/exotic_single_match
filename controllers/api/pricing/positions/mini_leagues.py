from controllers.api.pricing.positions import *

from products.positions.mini_leagues import MiniLeaguesProduct

# curl "http://localhost:8080/api/pricing/positions/mini_leagues/payoff"

class PayoffHandler(webapp2.RequestHandler):

    @emit_json
    def get(self):
        return [{"name": name}
                for name in [Winner, Bottom]]

# curl -X POST "http://localhost:8080/api/pricing/positions/mini_leagues/price" -d "{\"teams\": [{\"league\": \"ENG.1\", \"name\": \"Arsenal\", \"selected\": true}, {\"league\": \"SPA.1\", \"name\": \"Celta Vigo\"}, {\"league\": \"GER.1\", \"name\": \"Borussia Dortmund\"}], \"payoff\": \"Winner\", \"expiry\": \"2017-03-01\"}"

class PriceHandler(webapp2.RequestHandler):

    @parse_json_body
    @emit_json
    def post(self, query):
        product=MiniLeaguesProduct()
        contract=product.init_contract(query)
        return product.calc_price(contract)

Routing=[('/api/pricing/positions/mini_leagues/payoff', PayoffHandler),
         ('/api/pricing/positions/mini_leagues/price', PriceHandler)]

app=webapp2.WSGIApplication(Routing)
