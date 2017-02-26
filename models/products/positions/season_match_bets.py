from models.products.positions import *

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
    




