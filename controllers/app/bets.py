from controllers.app import *

import quant.exotic_acca as exotic_acca

Seed, Paths = 13, 5000

ExoticAccaWinner="exotic_acca_winner"

class PriceHandler(webapp2.RequestHandler):

    def update_bet(self, bet):
        if bet["name"]==ExoticAccaWinner:
            bet["resultCondition"]=exotic_acca.Win
            bet["legsCondition"]=exotic_acca.GTE
            bet["goalsCondition"]=exotic_acca.GTE
            
    @parse_json_body
    @emit_json
    def post(self, bet, limit=0.005):
        self.update_bet(bet)
        matches=Blob.fetch("app/matches")
        prob=exotic_acca.calc_probability(bet,
                                          matches,
                                          seed=Seed,
                                          paths=Paths)
        price=1/float(max(limit, prob))
        return {"price": price}
        
Routing=[('/app/bets/price', PriceHandler)]

app=webapp2.WSGIApplication(Routing)

