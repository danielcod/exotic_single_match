from models.bets.positions import *

MinProb, MaxProb = 0.01, 0.99

class SingleTeamOutrightBet(db.Model):

    league=db.StringProperty()
    team=db.StringProperty()
    payoff=db.StringProperty()
    expiry=db.DateProperty()

    price=db.StringProperty()

    @classmethod
    def from_json(self, params):
        return SingleTeamOutrightBet(league=params["league"],
                                         team=params["team"],
                                         payoff=params["payoff"],
                                         expiry=params["expiry"])

    
    @classmethod
    def find_all(self, leaguename=None, teamname=None):
        query=SingleTeamOutrightBet.all()
        if leaguename:
            query.filter("league = ", leaguename)
        if teamname:
            query.filter("team = ", teamname)
        return fetch_models_db(query)
    
    @classmethod
    def init_payoffs(self, leaguename):
        teams=fetch_teams(leaguename)
        names=[]
        names.append("Winner")
        for i in range(2, 1+len(teams)/2):
            names.append("Top %i" % i)
        for i in range(2, 1+len(teams)/2):
            names.append("Outside Top %i" % i)
        names.append("Bottom")
        for i in range(2, 1+len(teams)/2):
            names.append("Bottom %i" % i)
        for i in range(2, 1+len(teams)/2):
            names.append("Outside Bottom %i" % i)
        for i in range(2, len(teams)):
            names.append("%i%s Place" % (i, cardinal_suffix(i)))
        return [{"name": name}
                for name in names]

    @classmethod
    def filter_atm_payoffs(self, leaguename,
                           paths=Paths, seed=Seed,
                           minprob=MinFilterProb, maxprob=MaxFilterProb):
        teams=fetch_teams(leaguename)
        results=fetch_results(leaguename)
        fixtures=[fixture for fixture in fetch_fixtures(leaguename)
                  if fixture["date"] > Today] # NB no expiry check
        if fixtures==[]:
            raise RuntimeError("No fixtures found")
        pp=simulator.simulate(teams, results, fixtures, paths, seed)
        payoffs=self.init_payoffs(leaguename)
        for payoff in payoffs:
            payoff["payoff"]=parse_payoff(payoff["name"], len(teams))
        items=[]
        for team in teams:
            for payoff in payoffs:
                prob=sumproduct(payoff["payoff"], pp[team["name"]])
                if minprob < prob < maxprob:
                    item={"team": team["name"],
                          "payoff": payoff["name"],
                          "probability": prob}
                    items.append(item)
        return items
    
    def calc_probability(self, paths=Paths, seed=Seed):
        teams=fetch_teams(self.league)
        results=fetch_results(self.league)
        fixtures=[fixture for fixture in fetch_fixtures(self.league)
                  if (fixture["date"] > Today and
                      fixture["date"] <= self.expiry)]
        if fixtures==[]:
            raise RuntimeError("No fixtures found")
        pp=simulator.simulate(teams, results, fixtures, paths, seed)
        payoff=parse_payoff(self.payoff, len(teams))
        return sumproduct(payoff, pp[self.team])

    def to_json(self):
        return {"type": "single_team_outright",
                "id": self.key().id(),
                "league": self.league,
                "team": self.team,
                "payoff": self.payoff,
                "expiry": self.expiry,
                "price": self.price,
                "description": self.description}
        
    @property
    def description(self):
        def format_payoff(payoff):
            if payoff=="Winner":
                return "top of the table"
            elif payoff=="Bottom":
                return "bottom of the table"
            elif re.search("^Top", payoff):
                return "in the %s" % payoff.lower()
            elif re.search("^Bottom", payoff):
                return "in the %s" % payoff.lower()
            elif re.search("^Outside", payoff):
                return "outside the %s" % " ".join(payoff.lower().split(" ")[1:])
            elif re.search("Place$", payoff):
                return "in "+payoff.lower()
            else:
                return payoff
        return {"selection": self.team, # include league ?
                "market": "%s at %s" % (format_payoff(self.payoff).capitalize(),
                                        format_date(self.expiry)),
                "group": {"label": "Outright",
                          "level": "red"}}
    

