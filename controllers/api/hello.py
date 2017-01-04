from controllers.api import *

import apis.yc_lite_api as yclite

import quant.simulator as simulator

Paths, Seed = 1000, 13

# curl "http://localhost:8080/api/hello?league=ENG.1&team=Arsenal"

class IndexHandler(webapp2.RequestHandler):

    @validate_query({'league': '\\D{3}\\.\\d',
                     'team': '.+'})
    @emit_json
    def get(self):         
        leaguename=self.request.get("league")
        teamname=self.request.get("team")
        teams=yclite.get_teams(leaguename)
        results=yclite.get_results(leaguename)
        """
        - yclite fixtures don't contain dates
        - more realistic option would involve loading events from db to see what games are upcoming; then filter subset of fixture by date range
        - however using full set of fixtures will do for now
        """        
        remfixtures=yclite.get_remaining_fixtures(leaguename)
        pp=simulator.simulate(teams, results, remfixtures, Paths, Seed)
        if teamname not in pp:
            raise RuntimeError("Team not found")
        return pp[teamname][0] # Winner

Routing=[('/api/hello', IndexHandler)]

app=webapp2.WSGIApplication(Routing)
