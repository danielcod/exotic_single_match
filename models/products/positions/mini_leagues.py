from models.products.positions import *

class MiniLeagueBetProduct(db.Model):

    league=db.StringProperty()
    team=db.StringProperty()
    price=db.StringProperty()

    @classmethod
    def find_all(self, leaguename=None, teamname=None):
        query=MiniLeagueBetProduct.all()
        if leaguename:
            query.filter("league = ", leaguename)
        if teamname:
            query.filter("team = ", teamname)            
        return fetch_models_db(query)

    def calc_probability(self, paths=Paths, seed=Seed):
        import random
        random.seed(seed)
        return 0.1+0.8*random.random()

    @property
    def json_struct(self):
        return {"type": "mini_league",
                "params": {"description": self.description,
                           "price": self.price,
                           "id": self.key().id()}}
        
    @property
    def description(self):
        return {"selection": self.team, # include league ?
                "market": "Mini- League",
                "group": {"label": "Mini-League",
                          "level": "green"}}
    


