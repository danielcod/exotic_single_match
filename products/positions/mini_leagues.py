from products.positions import *

class MiniLeaguesProduct:

    def init_contract(self, query):
        selectedteam=filter_selected_team(query["teams"])
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
        
