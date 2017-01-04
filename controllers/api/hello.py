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
        # unpack request
        leaguename=self.request.get("league")
        teamname=self.request.get("team")
        # teams
        allteams=yclite.get_teams(leaguename)
        allteamnames=[team["name"]
                      for team in allteams]
        if teamname not in allteamnames:
            raise RuntimeError("Team not found")
        teams=allteams # TEMP
        # results
        allresults=yclite.get_results(leaguename)
        results=allresults # TEMP
        # remfixtures
        allremfixtures=yclite.get_remaining_fixtures(leaguename)
        remfixtures=allremfixtures # TEMP
        # simulate
        pp=simulator.simulate(teams, results, remfixtures, Paths, Seed)
        # return 
        return pp[teamname][0] # Winner

Routing=[('/api/hello', IndexHandler)]

app=webapp2.WSGIApplication(Routing)
