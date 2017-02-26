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

    def calc_probability(self):
        today=datetime.date.today()
        team={"league": self.league,
              "name": self.team}
        teams=[team_ for team_ in fetch_teams(self.league)
               if team_["name"] in [self.team, self.versus]]
        results=[result for result in fetch_results(self.league)
                 if (self.team in result["name"] or
                     self.versus in result["name"])]
        fixtures=[fixture
                  for fixture in fetch_fixtures(self.league)
                  if ((fixture["date"] > Today) and
                      (fixture["date"] <= self.expiry) and
                      ((self.team in fixture["name"]) or
                       (self.versus in fixture["name"])))]
        payoffs=[{"name": self.Payoff}]
        struct={"team": team,
                "teams": teams,
                "results": results,
                "fixtures": fixtures,
                "payoffs": payoffs}
        resp=calc_positional_probability(struct)
        return resp[0]["value"]

    @property
    def description(self):
        def format_expiry(expiry):
            return re.sub("End", "end", format_date(expiry))
        return {"selection": self.team, # include league ?
                "market": "To be above %s at %s" % (self.versus,
                                                    format_expiry(self.expiry)),
                "group": {"label": "SMB",
                          "level": "orange"}}
    




