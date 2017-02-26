from models.products.positions import *

MinProb, MaxProb = 0.01, 0.99

class SingleTeamOutrightProduct(db.Model):

    league=db.StringProperty()
    team=db.StringProperty()
    payoff=db.StringProperty()
    expiry=db.DateProperty()
    price=db.StringProperty()

    @classmethod
    def find_all(self):
        query=SingleTeamOutrightProduct.all()
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

    """
    - NB is calculated at end of season
    """
    
    @classmethod
    def filter_itm_selections(self, leaguename,
                              paths=Paths, seed=Seed,
                              maxprob=MaxProb, minprob=MinProb):
        teams=fetch_teams(leaguename)
        results=fetch_results(leaguename)
        fixtures=[fixture for fixture in fetch_fixtures(leaguename)
                  if (fixture["date"] > Today and
                      fixture["date"] <= self.expiry)]
        pp=simulator.simulate(teams, results, fixtures, paths, seed)
        payoffs=self.init_payoffs(leaguename)
        items=[]
        for team in teams:
            for payoff in payoffs:
                value=sumproduct(payoff, pp[team["name"]])
                if minprob < value < maxprob:
                    item={"team": team["name"],
                          "payoff": payoffname}
                    items.append(item)
        return items
    
    def calc_probability(self, paths=Paths, seed=Seed):
        teams=fetch_teams(self.league)
        results=fetch_results(self.league)
        fixtures=[fixture for fixture in fetch_fixtures(self.league)
                  if (fixture["date"] > Today and
                      fixture["date"] <= self.expiry)]
        pp=simulator.simulate(teams, results, fixtures, paths, seed)
        payoff=parse_payoff(self.payoff, len(teams))
        return sumproduct(payoff, pp[self.team])

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
        def format_expiry(expiry):
            return re.sub("End", "end", format_date(expiry))
        return {"selection": self.team, # include league ?
                "market": "%s at %s" % (format_payoff(self.payoff).capitalize(),
                                        format_expiry(self.expiry)),
                "group": {"label": "Outright",
                          "level": "red"}}
    


