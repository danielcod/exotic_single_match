from controllers.api.pricing.positions import *

# curl -X POST "http://localhost:8080/api/pricing/positions/mini_leagues" -d "{\"teams\": [{\"league\": \"ENG.1\", \"name\": \"Arsenal\", \"selected\": true}, {\"league\": \"SPA.1\", \"name\": \"Celta Vigo\"}, {\"league\": \"GER.1\", \"name\": \"Borussia Dortmund\"}], \"payoff\": \"Winner\", \"expiry\": \"2017-03-01\"}"

class IndexHandler(webapp2.RequestHandler):
    
    def filter_selected_team(self, teams):
        for team in teams:
            if ("selected" in team and
                team["selected"]):
                return team
        raise RuntimeError("Selected team not found")            

    def fetch_fixtures(self, teams):
        leaguenames=set([team["league"]
                         for team in teams])
        fixtures=[]
        for leaguename in leaguenames:
            fixtures+=fetch_fixtures(leaguename)
        return fixtures
    
    def filter_fixtures(self, fixtures, teams, expirydate, startdate=Today):
        teamnames=[team["name"]
                   for team in teams]
        def filterfn(fixtures):
            matchteamnames=fixtures["name"].split(" vs ")
            return ((matchteamnames[0] in teamnames or
                     matchteamnames[1] in teamnames) and
                    fixture["date"] > startdate and
                    fixture["date"] <= expirydate)
        return [fixture for fixture in fixtures
                if filterfn(fixture)]

    """
    - use teams supplied by user
    - results=[]
    """
    
    @parse_json_body
    @emit_json
    def post(self, req, results=[]): 
        selectedteam=self.filter_selected_team(req["teams"])
        allfixtures=self.fetch_fixtures(req["teams"])
        expiry=init_expiry_date(allfixtures, req["expiry"])
        fixtures=self.filter_fixtures(allfixtures, req["teams"], expiry)
        env={"teams": req["teams"],
             "results": results, 
             "fixtures": fixtures}
        probability=calc_probability(env, req["payoff"], selectedteam["name"])
        return {"decimal_price": "%.3f" % (1/probability)}

Routing=[('/api/pricing/positions/mini_leagues', IndexHandler)]

app=webapp2.WSGIApplication(Routing)
