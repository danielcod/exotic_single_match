from products.positions import *

class MiniLeaguesProduct:

    def filter_selected_team(self, teams):
        for team in teams:
            if ("selected" in team and
                team["selected"]):
                return team
        raise RuntimeError("Selected team not found")            
    
    def init_contract(self, query):
        selectedteam=self.filter_selected_team(query["teams"])
        allfixtures=Event.fetch_fixtures([team["league"]
                                          for team in query["teams"]])
        fixtures=filter_fixtures(allfixtures, query["teams"], query["expiry"])
        index=parse_payoff_index(query["payoff"])
        return {"team": selectedteam,
                "teams": query["teams"],
                "results": [], 
                "fixtures": fixtures,
                "index": index}
        
    def calc_probability(self, contract):
        return calc_positional_probability(contract)
        
