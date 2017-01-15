from products.positions import *

MinProbability, MaxProbability = 0.01, 0.99

class SingleTeamsProduct:

    """
    - NB pricing to end of season
    """
        
    def init_payoffs(self, leaguename, teamname=None):
        teams=fetch_teams(leaguename)
        results=fetch_results(leaguename)
        fixtures=[fixture for fixture in fetch_fixtures(leaguename)
                  if fixture["date"] > Today]
        def all_payoff_names(teams):
            names=[]
            names.append("Winner")
            for i in range(2, 1+len(teams)/2):
                names.append("Top %i" % i)
            names.append("Bottom")
            for i in range(2, 1+len(teams)/2):
                names.append("Bottom %i" % i)
            for i in range(2, len(teams)):
                names.append("%i%s Place" % (i, cardinal_suffix(i)))
            return names        
        contract={"team": {"name": teamname},
                  "teams": teams,
                  "results": results,
                  "fixtures": fixtures,
                  "payoffs": [{"name": payoffname}
                              for payoffname in all_payoff_names(teams)]}
        return [payoff for payoff in calc_positional_probability(contract)
                if (payoff["value"] > MinProbability and
                    payoff["value"] < MaxProbability)]

    def validate_query(self, query):
        pass
    
    def init_contract(self, query):
        team={"league": query["league"],
              "name": query["team"]}
        teams=fetch_teams(query["league"])
        results=fetch_results(query["league"])
        fixtures=[fixture
                  for fixture in fetch_fixtures(query["league"])
                  if (fixture["date"] > Today and
                      fixture["date"] <= query["expiry"])]
        payoffs=[{"name": query["payoff"]}]
        return {"team": team,
                "teams": teams,
                "results": results,
                "fixtures": fixtures,
                "payoffs": payoffs}
    
    def price_contract(self, contract):
        return calc_positional_probability(contract)
            
