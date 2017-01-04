from controllers.api import *

import apis.yc_lite_api as yclite

import quant.simulator as simulator

Paths, Seed = 1000, 13

MaxProb, MinProb = 0.99, 0.01

# curl "http://localhost:8080/api/hello?league=ENG.1&team=Arsenal&teams=Arsenal,Liverpool,Man%20Utd&payoff=Winner&use_results=true&expiry=2017-03-01"

# curl "http://iosport-exotics-engine.appspot.com/api/hello?league=ENG.1&team=Arsenal&teams=Arsenal,Liverpool,Man%20Utd&payoff=Winner&use_results=true&expiry=2017-03-01"

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
    
    @validate_query({'league': '^\\D{3}\\.\\d$',
                     'team': '.+',
                     'teams': '.+',
                     'payoff': '^(Winner)|(Top \\d+)|(Bottom \\d+)|(Bottom)$',
                     'use_results': '^(true)|(false)$',
                     'expiry': '^\\d{4}\\-\\d{1,2}\\-\\d{1,2}$'})
    @emit_json
    def get(self):
        # unpack request
        leaguename=self.request.get("league")
        teamname=self.request.get("team")
        teamnames=self.request.get("teams")
        payoff=self.request.get("payoff")
        useresults=eval(self.request.get("use_results").capitalize()) # because bool("false")==True :-/
        expiry=datetime.datetime.strptime(self.request.get("expiry"), "%Y-%m-%d").date()
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
        logging.info("%i teams" % len(teams))
        # results
        allresults=yclite.get_results(leaguename)        
        if useresults:
            def filterfn(result):
                matchteamnames=result["name"].split(" vs ")
                return (matchteamnames[0] in teamnames or
                        matchteamnames[1] in teamnames)
            results=[result for result in allresults
                     if filterfn(result)]
        else:
            results=[]
        logging.info("%i results" % len(results))
        # events
        today=datetime.date.today()
        allevents=sorted(Event.find_all(leaguename),
                         key=lambda x: x.date)
        events=[event for event in allevents
                if event.date > today and event.date <= expiry]
        logging.info("%i events" % len(events))
        # remfixtures
        allremfixtures=yclite.get_remaining_fixtures(leaguename)
        eventnames=[event.name
                    for event in events]
        remfixtures=[remfixture
                     for remfixture in allremfixtures
                     if remfixture["name"] in eventnames]
        logging.info("%i rem fixtures" % len(remfixtures))
        # pricing        
        index=self.get_payoff_index(payoff)
        logging.info("index %s" % index)
        pp=simulator.simulate(teams, results, remfixtures, Paths, Seed)
        prob=sum([pp[teamname][i]
                  for i in index])
        logging.info("probability %.5f" % prob)
        if prob < MinProb or prob > MaxProb:
            price=None
        else:
            price=1/float(prob)
        # return
        return {"price": price}

Routing=[('/api/hello', IndexHandler)]

app=webapp2.WSGIApplication(Routing)
