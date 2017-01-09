from controllers.api.pricing import *

from products.positions.single_teams import SingleTeamsProduct

# curl "http://localhost:8080/api/pricing/single_teams/payoff?league=ENG.1"

class PayoffHandler(webapp2.RequestHandler):

    @validate_query({'league': '\\D{3}\\.\\d'})
    @emit_json
    def get(self):
        leaguename=self.request.get("league")
        product=SingleTeamsProduct()
        return [{"name": name}
                for name in product.payoff_names(leaguename)]

# curl -X POST "http://localhost:8080/api/pricing/single_teams/price" -d "{\"product\": \"single_teams\", \"query\": {\"league\": \"ENG.1\", \"team\": \"Chelsea\", \"payoff\": \"Winner\", \"expiry\": \"2017-03-01\"}}"
    
class PriceHandler(webapp2.RequestHandler):

    @parse_json_body
    @emit_json
    def post(self, struct):
        query=struct["query"]
        product=SingleTeamsProduct()
        product.validate_query(query)
        contract=product.init_contract(query)
        probability=product.price_contract(contract)
        return {"decimal_price": format_price(probability)}

Routing=[('/api/pricing/single_teams/payoff', PayoffHandler),
         ('/api/pricing/single_teams/price', PriceHandler)]

app=webapp2.WSGIApplication(Routing)
