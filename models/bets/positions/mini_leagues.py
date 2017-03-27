from models.bets.positions import *

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
    
    @classmethod
    def find_all(self, leaguename=None, teamname=None):
        query=MiniLeagueBet.all()
        if leaguename:
            query.filter("league = ", leaguename)
        if teamname:
            query.filter("team = ", teamname)            
        return fetch_models_db(query)

    def calc_probability(self, paths=Paths, seed=Seed):
        import random
        return 0.1+0.8*random.random()

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
                          "level": "green"}}
    


