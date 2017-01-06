from controllers.api.pricing.positions import *

# curl -X POST "http://localhost:8080/api/pricing/positions/mini_leagues" -d "{\"teams\": [{\"league\": \"ENG.1\", \"name\": \"Arsenal\", \"selected\": true}, {\"league\": \"ENG.1\", \"name\": \"Liverpool\"}, {\"league\": \"ENG.1\", \"name\": \"Man Utd\"}], \"payoff\": \"Winner\", \"expiry\": \"2017-03-01\"}"

class IndexHandler(webapp2.RequestHandler):

    def filter_selected_team(self, teams):
        for team in teams:
            if ("selected" in team and
                team["selected"]):
                return team
        raise RuntimeError("Selected team not found")            
    
    @parse_json_body
    @emit_json
    def post(self, req, results=[]): # NB no initial results state
        selectedteam=self.filter_selected_team(req["teams"])
        allteams=fetch_teams(selectedteam["league"])
        teams=filter_teams(allteams, [team["name"]
                                      for team in req["teams"]])
        allfixtures=fetch_fixtures(selectedteam["league"])
        expiry=init_expiry_date(allfixtures, req["expiry"])
        fixtures=filter_fixtures(allfixtures, teams, expiry)
        env={"teams": teams,
             "results": results, 
             "fixtures": fixtures}
        probability=calc_probability(env, req["payoff"], selectedteam["name"])
        return {"decimal_price": "%.3f" % (1/probability)}

Routing=[('/api/pricing/positions/mini_leagues', IndexHandler)]

app=webapp2.WSGIApplication(Routing)
