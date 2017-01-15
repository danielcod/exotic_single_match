from products.positions import *

class MiniLeaguesProduct:

    def payoff_names(self, leaguename=None, teamname=None):
        return ["Winner",
                "Bottom"]
    
    def validate_query(self, query):
        pass
    
    def filter_selected_team(self, teams):
        for team in teams:
            if ("selected" in team and
                team["selected"]):
                return team
        raise RuntimeError("Selected team not found")            
    
    def init_contract(self, query):
        selectedteam=self.filter_selected_team(query["teams"])
        allfixtures=fetch_fixtures([team["league"]
                                    for team in query["teams"]])
        fixtures=filter_fixtures(allfixtures, query["teams"], query["expiry"])
        payoffs=[{"name": query["payoff"]}]
        return {"team": selectedteam,
                "teams": query["teams"],
                "results": [], 
                "fixtures": fixtures,
                "payoffs": payoffs}

    def price_contract(self, contract):
        return calc_positional_probability(contract)
    

        
