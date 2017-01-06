from controllers.api.pricing.positions import *

# curl "http://localhost:8080/api/pricing/positions/single_teams?league=ENG.1&team=Arsenal&payoff=Winner&expiry=2017-03-01"
    
class IndexHandler(webapp2.RequestHandler):

    @validate_query({'league': '^\\D{3}\\.\\d$',
                     'team': '.+',
                     'payoff': '^(Winner)|(Top \\d+)|(Bottom \\d+)|(Bottom)$',
                     'expiry': '^(\\d{4}\\-\\d{1,2}\\-\\d{1,2})|(EOS)$'})
    @emit_json
    def get(self):
        leaguename=self.request.get("league")
        teamname=self.request.get("team")
        payoff=self.request.get("payoff")
        expirystr=self.request.get("expiry")
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
