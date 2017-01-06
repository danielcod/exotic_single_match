from controllers.api.pricing.positions import *

# curl "http://localhost:8080/api/pricing/positions/mini_leagues?league=ENG.1&team=Arsenal&teams=Arsenal,Liverpool,Man%20Utd&payoff=Winner&expiry=2017-03-01"

class IndexHandler(webapp2.RequestHandler):

    @validate_query({'league': '^\\D{3}\\.\\d$',
                     'team': '.+',
                     'teams': '.*',
                     'payoff': '^(Winner)|(Top \\d+)|(Bottom \\d+)|(Bottom)$',
                     'expiry': '^(\\d{4}\\-\\d{1,2}\\-\\d{1,2})|(EOS)$'})
    @emit_json
    def get(self, results=[]): # NB no initial results state
        leaguename=self.request.get("league")
        teamname=self.request.get("team")
        teamnames=parse_list(self.request.get("teams"))
        if teamname not in teamnames:
            teamnames+=teamname
        payoff=self.request.get("payoff")
        expirystr=self.request.get("expiry")
        allteams=fetch_teams(leaguename)
        validate_teamnames(allteams, teamnames)
        teams=filter_teams(allteams, teamnames)
        allfixtures=fetch_fixtures(leaguename)
        expiry=filter_expiry_date(allfixtures, expirystr)
        fixtures=filter_fixtures(allfixtures, teams, expiry)
        env={"teams": teams,
             "results": results, 
             "fixtures": fixtures}
        probability=calc_probability(env, payoff, teamname)
        return {"decimal_price": "%.3f" % (1/probability)}

Routing=[('/api/pricing/positions/mini_leagues', IndexHandler)]

app=webapp2.WSGIApplication(Routing)
