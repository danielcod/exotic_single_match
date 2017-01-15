from products.positions import *

class SingleTeamsProduct:

    """
    - could be extended to price range of different products for specified team which have prices in 1-99% range (assuming max expiry)
    """
    
    def payoff_names(self, leaguename, teamname=None):
        teams=fetch_teams(leaguename)
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
        return {"team": team,
                "teams": teams,
                "results": results,
                "fixtures": fixtures,
                "payoff": query["payoff"]}
    
    def price_contract(self, contract):
        return calc_positional_probability(contract)
            
