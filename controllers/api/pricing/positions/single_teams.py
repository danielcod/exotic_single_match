from controllers.api.pricing.positions import *

# curl -X POST "http://localhost:8080/api/pricing/positions/single_teams" -d "{\"team\": {\"league\": \"ENG.1\", \"name\": \"Arsenal\"}, \"payoff\": \"Winner\", \"expiry\": \"2017-03-01\"}"
    
class IndexHandler(webapp2.RequestHandler):

    @parse_json_body
    @emit_json
    def post(self, struct):
        logging.info(struct)
        leaguename=struct["team"]["league"]
        teamname=struct["team"]["name"]
        payoff=struct["payoff"]
        expirystr=struct["expiry"]
        teams=fetch_teams(leaguename)
        validate_teamnames(teams, [teamname])
        results=fetch_results(leaguename)
        allfixtures=fetch_fixtures(leaguename)
        expiry=filter_expiry_date(allfixtures, expirystr)
        fixtures=filter_fixtures(allfixtures, teams, expiry)
        env={"teams": teams,
             "results": results,
             "fixtures": fixtures}
        probability=calc_probability(env, payoff, teamname)
        return {"decimal_price": "%.3f" % (1/probability)}

Routing=[('/api/pricing/positions/single_teams', IndexHandler)]

app=webapp2.WSGIApplication(Routing)
