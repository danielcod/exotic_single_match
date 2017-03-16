from models.products.positions import *

class MiniLeagueProduct(db.Model):

    league=db.StringProperty()
    team=db.StringProperty()
    price=db.StringProperty()

    @classmethod
    def find_all(self, leaguename=None, teamname=None):
        query=MiniLeagueProduct.all()
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
                "league": self.league,
                "team": self.team,
                "price": self.price,
                "description": self.description}
        
    @property
    def description(self):
        return {"selection": self.team, # include league ?
                "market": "Mini- League",
                "group": {"label": "Mini-League",
                          "level": "green"}}
    


