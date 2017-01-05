from controllers.api.pricing import *

Winner, Top, Bottom = "Winner", "Top", "Bottom"

Today=datetime.date.today()

class BaseHandler(webapp2.RequestHandler):

    def parse_boolean(self, boolstr):
        return boolstr.lower() in ["true", "1"]
    
    def parse_list(self, liststr):
        return liststr.split(",")

    """
    - extend to include other labels for end of different months
    """
    
    def parse_date(self, fixtures, expirystr):
        if expirystr==EOS:
            return sorted([fixture["date"]
                           for fixture in fixtures])[-1]
        elif re.search("^\\d{4}\\-\\d{1,2}\\-\\d{1,2}$", expirystr):
            return datetime.datetime.strptime(expirystr, "%Y-%m-%d").date()
        else:
            raise RuntimeError("Couldn't parse '%s' as date" % expirystr)

    """
    - should check in case index value exceeds payoff length
    """
        
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

    def validate_teamnames(self, teams, teamnames):
        allteamnames=[team["name"]
                      for team in teams]
        errors=[teamname for teamname in teamnames
                if teamname not in allteamnames]
        if errors!=[]:
            raise RuntimeError("Invalid teams: %s" % ", ".join(errors))
        
    def filter_teams(self, teams, teamnames):
        if All in teamnames:
            return teams
        return [team for team in teams
                if team["name"] in teamnames]
    
    def filter_fixtures(self, fixtures, teams, expirydate, startdate=Today):
        teamnames=[team["name"]
                   for team in teams]
        def filterfn(result):
            matchteamnames=result["name"].split(" vs ")
            return (matchteamnames[0] in teamnames or
                    matchteamnames[1] in teamnames)
        return [fixture for fixture in fixtures
                if (filterfn(fixture) and
                    fixture["date"] > startdate and
                    fixture["date"] <= expirydate)]

    def calc_probability(self, pp, index):
        return sum([pp[i] for i in index])

    def calc_price(self, prob, maxprob=MaxProb, minprob=MinProb):
        return 1/float(prob) if (prob > minprob and prob < maxprob) else None

"""
- single_teams assumes
  - all teams in league
  - results included from start of season
- probably a separate product which prices assuming zero points 
"""

# curl "http://localhost:8080/api/pricing/positions/single_teams?league=ENG.1&team=Arsenal&payoff=Winner&expiry=2017-03-01"
    
class SingleTeamsHandler(BaseHandler):
    
    @validate_query({'league': '^\\D{3}\\.\\d$',
                     'team': '.+',
                     'payoff': '^(Winner)|(Top \\d+)|(Bottom \\d+)|(Bottom)$',
                     'expiry': '^(\\d{4}\\-\\d{1,2}\\-\\d{1,2})|(EOS)$'})
    @emit_json
    def get(self):
        # unpack league
        leaguename=self.request.get("league")
        # fetch data
        allteams=yclite.get_teams(leaguename)
        allresults=yclite.get_results(leaguename)
        allfixtures=[fixture.to_json()
                   for fixture in Event.find_all(leaguename)]                
        # unpacket request
        teamname=self.request.get("team")
        payoff=self.parse_payoff(self.request.get("payoff"))
        expiry=self.parse_date(allfixtures, self.request.get("expiry"))
        # filter data
        teams, results = allteams, allresults
        fixtures=self.filter_fixtures(allfixtures, teams, expiry)
        for fixture in fixtures:
            fixture["probabilities"]=fixture.pop("yc_probabilities")
        # pricing        
        pp=simulator.simulate(teams, results, fixtures, Paths, Seed)
        probability=self.calc_probability(pp[teamname], payoff)
        price=self.calc_price(probability)
        return {"teams": teams,
                "results": results,
                "fixtures": fixtures,
                "probability": probability,
                "price": price}

"""
- mini_leagues assumes 
  - results=[] ie starts from today
"""

# curl "http://localhost:8080/api/pricing/positions/mini_leagues?league=ENG.1&team=Arsenal&teams=Arsenal,Liverpool,Man%20Utd&payoff=Winner&expiry=2017-03-01"

class MiniLeaguesHandler(BaseHandler):
    
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
        allfixtures=[fixture.to_json()
                   for fixture in Event.find_all(leaguename)]                
        # unpacket request
        teamname=self.request.get("team")
        teamnames=self.parse_list(self.request.get("teams"))
        if teamname not in teamnames:
            teamnames+=teamname
        self.validate_teamnames(allteams, teamnames)
        payoff=self.parse_payoff(self.request.get("payoff"))
        expiry=self.parse_date(allfixtures, self.request.get("expiry"))
        # filter data
        teams=self.filter_teams(allteams, teamnames)
        results=[] # NB
        fixtures=self.filter_fixtures(allfixtures, teams, expiry)
        for fixture in fixtures:
            fixture["probabilities"]=fixture.pop("yc_probabilities")
        # pricing        
        pp=simulator.simulate(teams, results, fixtures, Paths, Seed)
        probability=self.calc_probability(pp[teamname], payoff)
        price=self.calc_price(probability)
        return {"teams": teams,
                "results": results,
                "fixtures": fixtures,
                "probability": probability,
                "price": price}

Routing=[('/api/pricing/positions/single_teams', SingleTeamsHandler),
         ('/api/pricing/positions/mini_leagues', MiniLeaguesHandler)]

app=webapp2.WSGIApplication(Routing)
