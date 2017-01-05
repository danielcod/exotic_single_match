from controllers.api.pricing import *

Winner, Top, Bottom = "Winner", "Top", "Bottom"

Today=datetime.date.today()

# curl "http://localhost:8080/api/pricing/positions?league=ENG.1&team=Arsenal&teams=Arsenal,Liverpool,Man%20Utd&payoff=Winner&use_results=true&expiry=2017-03-01"

class IndexHandler(webapp2.RequestHandler):

    def parse_boolean(self, boolstr):
        return boolstr.lower() in ["true", "1"]
    
    def parse_list(self, liststr):
        return liststr.split(",")

    def parse_date(self, events, expirystr):
        if expirystr==EOS:
            return sorted([event["date"]
                           for event in events])[-1]
        elif re.search("^\\d{4}\\-\\d{1,2}\\-\\d{1,2}$", expirystr):
            return datetime.datetime.strptime(expirystr, "%Y-%m-%d").date()
        else:
            raise RuntimeError("Couldn't parse '%s' as date" % expirystr)

    def parse_payoff(self, payoff):
        if payoff==Winner:
            return [0]
        elif re.search(Top+" \\d+", payoff):
            n=int(re.findall("\\d+", payoff)[0])
            return [i for i in range(n)]
        elif re.search(Bottom+" \\d+", payoff):
            n=int(re.findall("\\d+", payoff)[0])
            return [-(1+i) for i in range(n)]
        elif payoff==Bottom:
            return [-1]
        else:
            raise RuntimeError("Payoff not recognised")
            
    def filter_teams(self, teams, teamnames):
        if All in teamnames:
            return teams
        return [team for team in teams
                if team["name"] in teamnames]
    
    def filter_results(self, results, teamnames):
        def filterfn(result):
            matchteamnames=result["name"].split(" vs ")
            return (matchteamnames[0] in teamnames or
                    matchteamnames[1] in teamnames)
        return [result for result in results
                if filterfn(result)]

    def filter_events(self, events, expirydate, startdate=Today):
        return [event for event in events
                if (event["date"] > startdate and
                    event["date"] <= expirydate)]

    def filter_remaining_fixtures(self, remfixtures, events):
        eventnames=[event["name"]
                    for event in events]
        return [remfixture
                for remfixture in remfixtures
                if remfixture["name"] in eventnames]

    def calc_probability(self, pp, index):
        return sum([pp[i] for i in index])

    def calc_price(self, prob, maxprob=MaxProb, minprob=MinProb):
        return 1/float(prob) if (prob > minprob and prob < maxprob) else None
    
    @validate_query({'league': '^\\D{3}\\.\\d$',
                     'team': '.+',
                     'teams': '.*',
                     'payoff': '^(Winner)|(Top \\d+)|(Bottom \\d+)|(Bottom)$',
                     'expiry': '^(\\d{4}\\-\\d{1,2}\\-\\d{1,2})|(EOS)$'})
    @emit_json
    def get(self):
        # unpack league
        leaguename=self.request.get("league")
        # fetch data
        allteams=yclite.get_teams(leaguename)
        allresults=yclite.get_results(leaguename)
        allremfixtures=yclite.get_remaining_fixtures(leaguename)
        allevents=[event.to_json()
                   for event in Event.find_all(leaguename)]                
        # unpacket request
        teamname=self.request.get("team")
        teamnames=self.parse_list(self.request.get("teams"))
        if teamname not in teamnames:
            teamnames+=teamname
        payoff=self.parse_payoff(self.request.get("payoff"))
        expiry=self.parse_date(allevents, self.request.get("expiry"))
        # filter data
        teams=self.filter_teams(allteams, teamnames)
        results=self.filter_results(allresults, teamnames) # could be []
        events=self.filter_events(allevents, expiry)
        remfixtures=self.filter_remaining_fixtures(allremfixtures, events)
        if remfixtures==[]:
            raise RuntimeError("No remaining fixtures")
        # pricing        
        pp=simulator.simulate(teams, results, remfixtures, Paths, Seed)
        probability=self.calc_probability(pp[teamname], payoff)
        price=self.calc_price(probability)
        return {"teams": teams,
                "results": results,
                "events": events,
                "remaining_fixtures": remfixtures,
                "probability": probability,
                "price": price}

Routing=[('/api/pricing/positions', IndexHandler)]

app=webapp2.WSGIApplication(Routing)
