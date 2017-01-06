from controllers.api.pricing.positions import *

# curl -X POST "http://localhost:8080/api/pricing/positions/mini_leagues" -d "{\"teams\": [{\"league\": \"ENG.1\", \"name\": \"Arsenal\"}, {\"league\": \"ENG.1\", \"name\": \"Liverpool\"}, {\"league\": \"ENG.1\", \"name\": \"Man Utd\"}], \"payoff\": \"Winner\", \"expiry\": \"2017-03-01\"}"

class IndexHandler(webapp2.RequestHandler):

    @parse_json_body
    @emit_json
    def post(self, req, results=[]): # NB no initial results state
        leaguename=req["teams"][0]["league"] # TEMP
        teamname=req["teams"][0]["name"] # TEMP
        teamnames=[team["name"]
                   for team in req["teams"]]
        allteams=fetch_teams(leaguename)
        validate_teamnames(allteams, teamnames)
        teams=filter_teams(allteams, teamnames)
        allfixtures=fetch_fixtures(leaguename)
        expiry=filter_expiry_date(allfixtures, req["expiry"])
        fixtures=filter_fixtures(allfixtures, teams, expiry)
        env={"teams": teams,
             "results": results, 
             "fixtures": fixtures}
        probability=calc_probability(env, req["payoff"], teamname)
        return {"decimal_price": "%.3f" % (1/probability)}

Routing=[('/api/pricing/positions/mini_leagues', IndexHandler)]

app=webapp2.WSGIApplication(Routing)
