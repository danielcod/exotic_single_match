from controllers.api.pricing.positions import *

from products.positions.single_teams import SingleTeamsProduct

"""
- max 24 teams per league
"""

def cardinal_suffix(i):
    if i in [1, 21]:
        return "st"
    elif i in [2, 22]:
        return "nd"
    elif i in [3, 23]:
        return "rd"
    else:
        return "th"

# curl "http://localhost:8080/api/pricing/positions/single_teams/payoff?league=ENG.1"

class PayoffHandler(webapp2.RequestHandler):

    @validate_query({'league': '\\D{3}\\.\\d'})
    @emit_json
    def get(self):
        leaguename=self.request.get("league")
        teams=yc_lite.get_teams(leaguename)
        if teams==[]:
            raise RuntimeError("No teams found")
        names=[]
        # Winner
        names.append("Winner")
        # Top X
        for i in range(2, 1+len(teams)/2):
            names.append("Top %i" % i)
        # Bottom
        names.append("Bottom")
        # Bottom X
        for i in range(2, 1+len(teams)/2):
            names.append("Bottom %i" % i)
        # X Place
        for i in range(2, len(teams)):
            names.append("%i%s Place" % (i, cardinal_suffix(i)))
        # return
        return [{"name": name}
                for name in names]

# curl -X POST "http://localhost:8080/api/pricing/positions/single_teams/price" -d "{\"league\": \"ENG.1\", \"team\": \"Chelsea\", \"payoff\": \"Winner\", \"expiry\": \"2017-03-01\"}"
    
class PriceHandler(webapp2.RequestHandler):

    @parse_json_body
    @emit_json
    def post(self, query):
        product=SingleTeamsProduct()
        contract=product.init_contract(query)
        probability=product.calc_probability(contract)
        return {"decimal_price": format_price(probability)}

Routing=[('/api/pricing/positions/single_teams/payoff', PayoffHandler),
         ('/api/pricing/positions/single_teams/price', PriceHandler)]

app=webapp2.WSGIApplication(Routing)
