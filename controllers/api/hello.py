from controllers.api import *

import apis.yc_lite_api as yclite

import quant.simulator as simulator

Paths, Seed = 1000, 13

# curl "http://localhost:8080/api/hello?league=ENG.1&team=Arsenal&teams=Arsenal,Liverpool,Man%20Utd&payoff=Winner&use_results=true"

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
                     'teams': '.+',
                     'payoff': '(Winner)|(Top \\d+)|(Bottom \\d+)|Bottom',
                     'use_results': '(true)|(false)'})
    @emit_json
    def get(self):
        # unpack request
        leaguename=self.request.get("league")
        teamname=self.request.get("team")
        teamnames=self.request.get("teams")
        payoff=self.request.get("payoff")
        useresults=eval(self.request.get("use_results").capitalize()) # because bool("false")==True :-/
        # teams
        allteams=yclite.get_teams(leaguename)
        allteamnames=[team["name"]
                      for team in allteams]
        if teamname not in allteamnames:
            raise RuntimeError("%s not found" % teamname)
        if teamnames in ['', None, []]:
            teamnames=allteamnames
        else:
            teamnames=teamnames.split(",")
            for _teamname in teamnames: # NB _teamname
                if _teamname not in allteamnames:
                    raise RuntimeError("%s not found" % _teamname)
        teams=[team for team in allteams
               if team["name"] in teamnames]
        # results
        allresults=yclite.get_results(leaguename)
        if useresults:
            results=allresults
        else:
            results=[]        
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
