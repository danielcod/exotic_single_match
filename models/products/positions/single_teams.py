from models.products.positions import *

class SingleTeamsProduct(db.Model):

    Description="<span class='label label-primary'>Team</span> <b><i>%s</i></b> (%s) %s %s %s" 

    
    league=db.StringProperty()
    team=db.StringProperty()
    payoff=db.StringProperty()
    expiry=db.DateProperty()
    price=db.StringProperty()

    @property
    def description(self):
        def format_payoff(payoff):
            if payoff=="Winner":
                return "top of the table"
            elif payoff=="Bottom":
                return "bottom of the table"
            elif payoff=="Promotion":
                return "promoted"
            elif payoff=="Relegation":
                return "relegated"
            elif re.search("^Top", payoff):
                return "in the %s" % payoff.lower()
            elif re.search("^Bottom", payoff):
                return "in the %s" % payoff.lower()
            elif re.search("^Outside", payoff):
                return "outside the %s" % " ".join(payoff.lower().split(" ")[1:])
            elif re.search("Place$", payoff):
                return "in "+payoff.lower()
            else:
                return payoff
        def format_expiry_delimiter(expiry):
            return "at"
        def format_expiry(expiry):
            return re.sub("End", "end", format_date(expiry))
        return self.Description % (self.team,
                                   self.league,
                                   format_payoff(self.payoff),
                                   format_expiry_delimiter(self.payoff),
                                   format_expiry(self.expiry))
    
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



