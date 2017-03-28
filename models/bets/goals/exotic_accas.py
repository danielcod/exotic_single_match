from models.bets.positions import *

class ExoticAccaBet(db.Model):

    teams=db.TextProperty()
    
    price=db.StringProperty()
    
    @classmethod
    def from_json(self, params):
        return ExoticAccaBet(teams=json_dumps(params["teams"]))
    
    def calc_probability(self, paths=Paths, seed=Seed):
        import random
        return 0.1+0.8*random.random()

    @add_id
    def to_json(self):
        return {"type": "exotic_acca",
                "teams": json_loads(self.teams),
                "price": self.price,
                "description": self.description}
        
    @property
    def description(self):
        return {"selection": "[selection]",
                "market": "[market]",
                "group": {"label": "Exotic Acca",
                          "level": "blue"}}
    


