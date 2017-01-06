from controllers.api.pricing.positions import *

# curl "http://localhost:8080/api/pricing/positions/mini_leagues?league=ENG.1&team=Arsenal&teams=Arsenal,Liverpool,Man%20Utd&payoff=Winner&expiry=2017-03-01"

class IndexHandler(webapp2.RequestHandler):
    
    @validate_query({'league': '^\\D{3}\\.\\d$',
                     'team': '.+',
                     'teams': '.*',
                     'payoff': '^(Winner)|(Top \\d+)|(Bottom \\d+)|(Bottom)$',
                     'expiry': '^(\\d{4}\\-\\d{1,2}\\-\\d{1,2})|(EOS)$'})
    @emit_json
    def get(self):
        # unpack request
        leaguename=self.request.get("league")
        teamname=self.request.get("team")
        teamnames=parse_list(self.request.get("teams"))
        if teamname not in teamnames:
            teamnames+=teamname
        payoff=self.request.get("payoff")
        expirystr=self.request.get("expiry")
        # fetch data
        allteams, allfixtures = (fetch_teams(leaguename),
                                 fetch_fixtures(leaguename))
        # initialise/validate
        validate_teamnames(allteams, teamnames)
        expiry=filter_expiry_date(allfixtures, expirystr)
        index=parse_payoff_index(payoff)
        # filter data
        teams=filter_teams(allteams, teamnames)
        results=[] # NB
        fixtures=filter_fixtures(allfixtures, teams, expiry)
        # pricing        
        pp=simulator.simulate(teams, results, fixtures, Paths, Seed)
        probability=sum([pp[teamname][i]
                         for i in index])
        return {"teams": teams,
                "results": results,
                "fixtures": fixtures,
                "probability": probability}

Routing=[('/api/pricing/positions/mini_leagues', IndexHandler)]

app=webapp2.WSGIApplication(Routing)
