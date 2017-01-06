from controllers.api.pricing.positions import *

# curl "http://localhost:8080/api/pricing/positions/single_teams?league=ENG.1&team=Arsenal&payoff=Winner&expiry=2017-03-01"
    
class IndexHandler(webapp2.RequestHandler):
    
    @validate_query({'league': '^\\D{3}\\.\\d$',
                     'team': '.+',
                     'payoff': '^(Winner)|(Top \\d+)|(Bottom \\d+)|(Bottom)$',
                     'expiry': '^(\\d{4}\\-\\d{1,2}\\-\\d{1,2})|(EOS)$'})
    @emit_json
    def get(self):
        # unpack league
        leaguename=self.request.get("league")
        teamname=self.request.get("team")
        payoff=self.request.get("payoff")
        expirystr=self.request.get("expiry")
        # fetch data
        allteams, allresults, allfixtures = (fetch_teams(leaguename),
                                             fetch_results(leaguename),
                                             fetch_fixtures(leaguename))
        # initialise/validate
        validate_teamnames(allteams, [teamname])
        expiry=filter_expiry_date(allfixtures, expirystr)
        index=parse_payoff_index(payoff)
        # filter data
        teams, results = allteams, allresults
        fixtures=filter_fixtures(allfixtures, teams, expiry)
        # pricing        
        pp=simulator.simulate(teams, results, fixtures, Paths, Seed)
        probability=sum([pp[teamname][i]
                         for i in index])
        return {"teams": teams,
                "results": results,
                "fixtures": fixtures,
                "probability": probability}

Routing=[('/api/pricing/positions/single_teams', IndexHandler)]

app=webapp2.WSGIApplication(Routing)
