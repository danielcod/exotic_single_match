from products.positions import *

class SingleTeamsProduct:

    def payoff_names(self, leaguename):
        teams=yc_lite.get_teams(leaguename)
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
        allteams=yc_lite.get_teams(query["league"])
        allresults=yc_lite.get_results(query["league"])
        allfixtures=Event.fetch_fixtures(query["league"])
        fixtures=[fixture for fixture in allfixtures
                  if (fixture["date"] > Today and
                      fixture["date"] <= query["expiry"])]
        index=parse_payoff_index(query["payoff"])
        return {"team": team,
                "teams": allteams,
                "results": allresults,
                "fixtures": fixtures,
                "index": index}        
    
    def price_contract(self, contract):
        return calc_positional_probability(contract)
            
