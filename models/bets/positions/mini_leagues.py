from models.bets.positions import *

MinFilterProb, MaxFilterProb = 0.01, 0.99

class MiniLeagueBet(db.Model):

    league=db.StringProperty()
    team=db.StringProperty()
    payoff=db.StringProperty()
    expiry=db.DateProperty()
    versus=db.TextProperty()
    
    price=db.StringProperty()
    
    @classmethod
    def from_json(self, params):
        return MiniLeagueBet(league=params["league"],
                             team=params["team"],
                             payoff=params["payoff"],
                             expiry=params["expiry"],
                             versus=json_dumps(params["versus"]))

    """
    NB mini_league pricing starts from today / all teams start on zero points
    """
    
    def calc_probability(self, paths=Paths, seed=Seed):
        teams, fixtures, results = [], [], []
        for team in [{"league": self.league,
                      "team": self.team}]+json_loads(self.versus):
            teams.append({"name": team["team"],
                          "points": 0,
                          "goal_diff": 0})
            fixtures+=[fixture for fixture in fetch_fixtures(team["league"])
                       if (fixture["date"] > Today and
                           fixture["date"] <= self.expiry and
                           team["team"] in fixture["name"])]
        if fixtures==[]:
            raise RuntimeError("No fixtures found")
        pp=yc_simulator.simulate(teams, results, fixtures, paths, seed)
        payoff=parse_payoff(self.payoff, len(teams))
        return sumproduct(payoff, pp[self.team])

    @add_id
    def to_json(self):
        return {"type": "mini_league",
                "league": self.league,
                "team": self.team,
                "payoff": self.payoff,
                "expiry": self.expiry,
                "versus": json_loads(self.versus),
                "price": self.price,
                "description": self.description}
        
    @property
    def description(self):
        marketstr="To be %s of mini league with %s at %s"
        return {"selection": self.team,
                "market": marketstr % (self.payoff.lower(),
                                       ", ".join([item["team"]
                                                  for item in json_loads(self.versus)]),                                       
                                       self.expiry),
                "group": {"label": "Mini-League",
                          "level": "teal"}}
    


