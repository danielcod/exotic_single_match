from models.products.positions import *

class SingleTeamsProduct(db.Model):

    league=db.StringProperty()
    team=db.StringProperty()
    payoff=db.StringProperty()
    expiry=db.DateProperty()
    price=db.StringProperty()

    @property
    def description(self):
        return "%s/%s/%s/%s" % (self.league,
                                self.team,
                                self.payoff,
                                self.expiry)
    
    @classmethod
    def find_all(self):
        query=SingleTeamsProduct.all()
        return fetch_models_db(query)
    
    @classmethod
    def init_payoffs(self, leaguename):
        teams=fetch_teams(leaguename)
        names=[]
        names.append("Winner")
        if leaguename in Promotion:
            names.append("Promotion")
        if leaguename in Relegation:
            names.append("Relegation")
        for i in range(2, 1+len(teams)/2):
            names.append("Top %i" % i)
        for i in range(2, 1+len(teams)/2):
            names.append("Outside Top %i" % i)
        names.append("Bottom")
        for i in range(2, 1+len(teams)/2):
            names.append("Bottom %i" % i)
        for i in range(2, 1+len(teams)/2):
            names.append("Outside Bottom %i" % i)
        for i in range(2, len(teams)):
            names.append("%i%s Place" % (i, cardinal_suffix(i)))
        return [{"name": name}
                for name in names]
    
    def calc_probability(self):
        today=datetime.date.today()
        team={"league": self.league,
              "name": self.team}
        teams=fetch_teams(self.league)
        results=fetch_results(self.league)
        fixtures=[fixture
                  for fixture in fetch_fixtures(self.league)
                  if (fixture["date"] > Today and
                      fixture["date"] <= self.expiry)]
        payoffs=[{"name": self.payoff}]
        struct={"team": team,
                "teams": teams,
                "results": results,
                "fixtures": fixtures,
                "payoffs": payoffs}
        resp=calc_positional_probability(struct)
        return resp[0]["value"]



