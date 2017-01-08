from controllers.api.pricing.positions import *

# curl "http://localhost:8080/api/pricing/positions/mini_leagues/payoff"

class PayoffHandler(webapp2.RequestHandler):

    @emit_json
    def get(self):
        return [{"name": name}
                for name in [Winner, Bottom]]
    
# curl -X POST "http://localhost:8080/api/pricing/positions/mini_leagues/price" -d "{\"teams\": [{\"league\": \"ENG.1\", \"name\": \"Arsenal\", \"selected\": true}, {\"league\": \"SPA.1\", \"name\": \"Celta Vigo\"}, {\"league\": \"GER.1\", \"name\": \"Borussia Dortmund\"}], \"payoff\": \"Winner\", \"expiry\": \"2017-03-01\"}"

class PriceHandler(webapp2.RequestHandler):

    def init_contract(self, query):
        selectedteam=filter_selected_team(query["teams"])
        allfixtures=Event.fetch_fixtures([team["league"]
                                         for team in query["teams"]])
        expiry=init_expiry_date(allfixtures, query["expiry"])
        fixtures=filter_fixtures(allfixtures, query["teams"], expiry)
        index=parse_payoff_index(query["payoff"])
        return {"team": selectedteam,
                "teams": query["teams"],
                "results": [], 
                "fixtures": fixtures,
                "index": index}
        
    @parse_json_body
    @emit_json
    def post(self, query):
        contract=self.init_contract(query)
        probability=calc_probability(contract)
        return {"decimal_price": format_price(probability)}

Routing=[('/api/pricing/positions/mini_leagues/payoff', PayoffHandler),
         ('/api/pricing/positions/mini_leagues/price', PriceHandler)]

app=webapp2.WSGIApplication(Routing)
