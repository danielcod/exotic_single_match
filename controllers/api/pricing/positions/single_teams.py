from controllers.api.pricing.positions import *

# curl -X POST "http://localhost:8080/api/pricing/positions/single_teams/price" -d "{\"league\": \"ENG.1\", \"team\": \"Chelsea\", \"payoff\": \"Winner\", \"expiry\": \"2017-03-01\"}"
    
class PriceHandler(webapp2.RequestHandler):

    @parse_json_body
    @emit_json
    def post(self, req):
        allteams=fetch_teams(req["league"])
        allresults=fetch_results(req["league"])
        allfixtures=fetch_fixtures(req["league"])
        expiry=init_expiry_date(allfixtures, req["expiry"])
        fixtures=[fixture for fixture in allfixtures
                  if (fixture["date"] > Today and
                      fixture["date"] <= expiry)]
        env={"teams": allteams,
             "results": allresults,
             "fixtures": fixtures}
        probability=calc_probability(env, req["payoff"], req["team"])
        return {"decimal_price": format_price(probability)}

Routing=[('/api/pricing/positions/single_teams/price', PriceHandler)]

app=webapp2.WSGIApplication(Routing)
