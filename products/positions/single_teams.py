from products.positions import *

class SingleTeamsProduct:

    def init_contract(self, query):
        team={"league": query["league"],
              "name": query["team"]}
        allteams=yc_lite.get_teams(query["league"])
        allresults=yc_lite.get_results(query["league"])
        allfixtures=Event.fetch_fixtures(query["league"])
        expiry=init_expiry_date(allfixtures, query["expiry"])
        fixtures=[fixture for fixture in allfixtures
                  if (fixture["date"] > Today and
                      fixture["date"] <= expiry)]
        index=parse_payoff_index(query["payoff"])
        return {"team": team,
                "teams": allteams,
                "results": allresults,
                "fixtures": fixtures,
                "index": index}        
    
    def calc_probability(self, contract):
        return calc_positional_probability(contract)
            
