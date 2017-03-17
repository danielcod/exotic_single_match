from models.bets.positions import *

class MiniLeagueBet(db.Model):

    versus=db.TextProperty()
    
    price=db.StringProperty()

    @classmethod
    def from_json(self, params):
        return MiniLeagueBet(versus=json_dumps(params["versus"]))
    
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

    def to_json(self):
        return {"type": "mini_league",
                "id": self.key().id(),
                "versus": json_loads(self.versus),
                "price": self.price,
                "description": self.description}
        
    @property
    def description(self):
        return {"selection": "Hello World",
                "market": "Mini- League",
                "group": {"label": "Mini-League",
                          "level": "green"}}
    


