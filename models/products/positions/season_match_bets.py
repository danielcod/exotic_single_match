from models.products.positions import *

MinProb, MaxProb = 0.01, 0.99

class SeasonMatchBetProduct(db.Model):

    Payoff="Winner"
    
    league=db.StringProperty()
    team=db.StringProperty()
    versus=db.StringProperty()
    expiry=db.DateProperty()
    price=db.StringProperty()

    @classmethod
    def find_all(self):
        query=SeasonMatchBetProduct.all()
        return fetch_models_db(query)

    """
    - NB is calculated at end of season
    - is the probability calculation correct ??
    """
    
    @classmethod
    def filter_atm_versus(self, leaguename):
        teams=fetch_teams(leaguename)
        results=fetch_results(leaguename)
        fixtures=[fixture for fixture in fetch_fixtures(leaguename)
                  if (fixture["date"] > Today and
                      fixture["date"] <= self.expiry)]
        pp=simulator.simulate(teams, results, fixtures, paths, seed)
        items=[]
        for team in teams:
            for versus in teams:
                if team["name"]==versus["name"]:
                    continue
                diff=[x-y for x, y in zip(pp[team["name"]],
                                          pp[versus["name"]])]
                diff0, diff1 = (sum([v for v in diff if v > 0]),
                                sum([-v for v in diff if v < 0]))
                if (diff0+diff1)!=0:
                    prob=diff0/float(diff0+diff1)
                else:
                    prob=0.5
                if ((minprob < prob < maxprob) and
                    (minprob < prob < maxprob)):
                    item={"team": team["name"],
                          "versus": versus["name"],
                          "probability": prob}
                    items.append(item)
        return items
        
    
    def calc_probability(self, paths=Paths, seed=Seed):
        teams=[team for team in fetch_teams(self.league)
               if team["name"] in [self.team, self.versus]]
        results=[result for result in fetch_results(self.league)
                 if (self.team in result["name"] or
                     self.versus in result["name"])]
        fixtures=[fixture for fixture in fetch_fixtures(self.league)
                  if ((fixture["date"] > Today) and
                      (fixture["date"] <= self.expiry) and
                      ((self.team in fixture["name"]) or
                       (self.versus in fixture["name"])))]
        if fixtures==[]:
            raise RuntimeError("No fixtures found")
        pp=simulator.simulate(teams, results, fixtures, paths, seed)
        payoff=parse_payoff(self.Payoff, len(teams))
        return sumproduct(payoff, pp[self.team])

    @property
    def description(self):
        def format_expiry(expiry):
            return re.sub("End", "end", format_date(expiry))
        return {"selection": self.team, # include league ?
                "market": "To be above %s at %s" % (self.versus,
                                                    format_expiry(self.expiry)),
                "group": {"label": "SMB",
                          "level": "orange"}}
    




