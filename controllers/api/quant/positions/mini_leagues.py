from controllers.api.quant.positions import *

# curl "http://localhost:8080/api/quant/positions/mini_leagues/payoff"

class PayoffHandler(webapp2.RequestHandler):

    @emit_json
    def get(self):
        return [{"name": name}
                for name in [Winner, Bottom]]
    
# curl -X POST "http://localhost:8080/api/quant/positions/mini_leagues/price" -d "{\"teams\": [{\"league\": \"ENG.1\", \"name\": \"Arsenal\", \"selected\": true}, {\"league\": \"SPA.1\", \"name\": \"Celta Vigo\"}, {\"league\": \"GER.1\", \"name\": \"Borussia Dortmund\"}], \"payoff\": \"Winner\", \"expiry\": \"2017-03-01\"}"

class PriceHandler(webapp2.RequestHandler):
    
    @parse_json_body
    @emit_json
    def post(self, req): 
        selectedteam=filter_selected_team(req["teams"])
        allfixtures=Event.fetch_fixtures([team["league"]
                                         for team in req["teams"]])
        expiry=init_expiry_date(allfixtures, req["expiry"])
        fixtures=filter_fixtures(allfixtures, req["teams"], expiry)
        env={"teams": req["teams"],
             "results": [], 
             "fixtures": fixtures}
        probability=calc_probability(env, req["payoff"], selectedteam["name"])
        return {"decimal_price": format_price(probability)}

Routing=[('/api/quant/positions/mini_leagues/payoff', PayoffHandler),
         ('/api/quant/positions/mini_leagues/price', PriceHandler)]

app=webapp2.WSGIApplication(Routing)
