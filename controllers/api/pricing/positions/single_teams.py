from controllers.api.pricing.positions import *

# curl -X POST "http://localhost:8080/api/pricing/positions/single_teams" -d "{\"league\": \"ENG.1\", \"team\": \"Arsenal\", \"payoff\": \"Winner\", \"expiry\": \"2017-03-01\"}"
    
class IndexHandler(webapp2.RequestHandler):

    @parse_json_body
    @emit_json
    def post(self, req):
        teams=fetch_teams(req["league"])
        validate_teamnames(teams, [req["team"]])
        results=fetch_results(req["league"])
        allfixtures=fetch_fixtures(req["league"])
        expiry=filter_expiry_date(allfixtures, req["expiry"])
        fixtures=filter_fixtures(allfixtures, teams, expiry)
        env={"teams": teams,
             "results": results,
             "fixtures": fixtures}
        probability=calc_probability(env, req["payoff"], req["team"])
        return {"decimal_price": "%.3f" % (1/probability)}

Routing=[('/api/pricing/positions/single_teams', IndexHandler)]

app=webapp2.WSGIApplication(Routing)
