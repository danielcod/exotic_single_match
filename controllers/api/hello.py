from controllers.api import *

import apis.yc_lite_api as yclite

import quant.simulator as simulator

Paths, Seed = 1000, 13

# curl "http://localhost:8080/api/hello?league=ENG.1&team=Arsenal&payoff=Winner"

class IndexHandler(webapp2.RequestHandler):

    """
    - this will need heavily unit testing
    """
    
    def get_payoff_index(self, payoff):
        if payoff=="Winner":
            return [0]
        elif re.search("Top \\d+", payoff):
            n=int(re.findall("\\d+", payoff)[0])
            return [i for i in range(n)]
        elif re.search("Bottom \\d+", payoff):
            n=int(re.findall("\\d+", payoff)[0])
            return [-(1+i) for i in range(n)]
        elif payoff=="Bottom":
            return [-1]
        else:
            raise RuntimeError("Payoff not recognised")
    
    @validate_query({'league': '\\D{3}\\.\\d',
                     'team': '.+',
                     'payoff': '(Winner)|(Top \\d+)|(Bottom \\d+)|Bottom'})
    @emit_json
    def get(self):
        # unpack request
        leaguename=self.request.get("league")
        teamname=self.request.get("team")
        payoff=self.request.get("payoff")
        # teams
        allteams=yclite.get_teams(leaguename)
        allteamnames=[team["name"]
                      for team in allteams]
        if teamname not in allteamnames:
            raise RuntimeError("Team not found")
        teamnames=allteamnames # TEMP
        teams=[team for team in allteams
               if team["name"] in teamnames]
        # results
        allresults=yclite.get_results(leaguename)
        results=allresults # TEMP
        # remfixtures
        allremfixtures=yclite.get_remaining_fixtures(leaguename)
        remfixtures=allremfixtures # TEMP
        # simulate
        pp=simulator.simulate(teams, results, remfixtures, Paths, Seed)
        # return
        index=self.get_payoff_index(payoff)
        prob=sum([pp[teamname][i]
                  for i in index])
        return "%.2f" % (1/float(prob))

Routing=[('/api/hello', IndexHandler)]

app=webapp2.WSGIApplication(Routing)
