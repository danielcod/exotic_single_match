from controllers.api.pricing import *

# curl "http://localhost:8080/api/pricing/single_teams?league=ENG.1&team=Arsenal&payoff=Winner&expiry=2017-03-01"
    
class IndexHandler(BasePositionsHandler):
    
    @validate_query({'league': '^\\D{3}\\.\\d$',
                     'team': '.+',
                     'payoff': '^(Winner)|(Top \\d+)|(Bottom \\d+)|(Bottom)$',
                     'expiry': '^(\\d{4}\\-\\d{1,2}\\-\\d{1,2})|(EOS)$'})
    @emit_json
    def get(self):
        # unpack league
        leaguename=self.request.get("league")
        # fetch data
        allteams=yclite.get_teams(leaguename)
        allresults=yclite.get_results(leaguename)
        allfixtures=[fixture.to_json()
                   for fixture in Event.find_all(leaguename)]                
        # unpacket request
        teamname=self.request.get("team")
        payoff=self.parse_payoff(self.request.get("payoff"))
        expiry=self.parse_date(allfixtures, self.request.get("expiry"))
        # filter data
        teams, results = allteams, allresults
        fixtures=self.filter_fixtures(allfixtures, teams, expiry)
        for fixture in fixtures:
            fixture["probabilities"]=fixture.pop("yc_probabilities")
        # pricing        
        pp=simulator.simulate(teams, results, fixtures, Paths, Seed)
        probability=sum([pp[teamname][i]
                         for i in payoff])
        return {"teams": teams,
                "results": results,
                "fixtures": fixtures,
                "probability": probability}

Routing=[('/api/pricing/single_teams', IndexHandler)]

app=webapp2.WSGIApplication(Routing)
