from models.products.positions import *

class SeasonMatchBetProduct(db.Model):

    league=db.StringProperty()
    team=db.StringProperty()
    versus=db.StringProperty()
    expiry=db.DateProperty()
    price=db.StringProperty()

    @property
    def description(self):
        def format_expiry_delimiter(expiry):
            return "at"
        def format_expiry(expiry):
            return re.sub("End", "end", format_date(expiry))
        return {"selection": self.team, # include league ?
                "market": "To finish above %s" % self.versus,
                "group": {"label": "SMB",
                          "level": "orange"}}
    
    @classmethod
    def find_all(self):
        query=SeasonMatchBetProduct.all()
        return fetch_models_db(query)
    
    def calc_probability(self):
        import random
        return 0.1+0.8*random.random()



