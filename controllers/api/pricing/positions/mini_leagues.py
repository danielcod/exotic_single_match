from controllers.api.pricing.positions import *

# curl -X POST "http://localhost:8080/api/pricing/positions/mini_leagues" -d "{\"teams\": [{\"league\": \"ENG.1\", \"name\": \"Arsenal\", \"selected\": true}, {\"league\": \"ENG.1\", \"name\": \"Liverpool\"}, {\"league\": \"ENG.1\", \"name\": \"Man Utd\"}], \"payoff\": \"Winner\", \"expiry\": \"2017-03-01\"}"

class IndexHandler(webapp2.RequestHandler):

    def filter_selected_team(self, teams):
        for team in teams:
            if ("selected" in team and
                team["selected"]):
                return team
        raise RuntimeError("Selected team not found")            

    def filter_fixtures(self, fixtures, teams, expirydate, startdate=Today):
        teamnames=[team["name"]
                   for team in teams]
        def filterfn(result):
            matchteamnames=result["name"].split(" vs ")
            return (matchteamnames[0] in teamnames or
                    matchteamnames[1] in teamnames)
        return [fixture for fixture in fixtures
                if (filterfn(fixture) and
                    fixture["date"] > startdate and
                    fixture["date"] <= expirydate)]

    @parse_json_body
    @emit_json
    def post(self, req, results=[]): # NB no initial results state
        selectedteam=self.filter_selected_team(req["teams"])
        teams=req["teams"] # requires validation
        allfixtures=fetch_fixtures(selectedteam["league"])
        expiry=init_expiry_date(allfixtures, req["expiry"])
        fixtures=self.filter_fixtures(allfixtures, teams, expiry)
        env={"teams": teams,
             "results": results, 
             "fixtures": fixtures}
        probability=calc_probability(env, req["payoff"], selectedteam["name"])
        return {"decimal_price": "%.3f" % (1/probability)}

Routing=[('/api/pricing/positions/mini_leagues', IndexHandler)]

app=webapp2.WSGIApplication(Routing)
