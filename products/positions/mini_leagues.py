from products.positions import *

class MiniLeaguesProduct:

    def init_contract(self, query):
        selectedteam=filter_selected_team(query["teams"])
        allfixtures=Event.fetch_fixtures([team["league"]
                                         for team in query["teams"]])
        expiry=init_expiry_date(allfixtures, query["expiry"])
        fixtures=filter_fixtures(allfixtures, query["teams"], expiry)
        index=parse_payoff_index(query["payoff"])
        return {"team": selectedteam,
                "teams": query["teams"],
                "results": [], 
                "fixtures": fixtures,
                "index": index}
        
    def calc_price(self, contract):
        probability=calc_probability(contract)
        return {"decimal_price": format_price(probability)}
        
