from controllers.app import *

import quant.exotic_acca as exotic_acca

class PriceHandler(webapp2.RequestHandler):

    @parse_json_body
    @emit_json
    def post(self, bet, limit=0.005):
        logging.info("Bet: %s" % bet)
        bet["resultCondition"]=exotic_acca.Win
        bet["legsCondition"]=exotic_acca.GTE
        bet["goalsCondition"]=exotic_acca.GTE
        matches=Blob.fetch("app/matches")                
        prob=exotic_acca.calc_probability(bet, matches)
        logging.info("Probability: %.5f" % prob)
        price=1/float(max(limit, prob))
        return {"price": price}
        
Routing=[('/app/bets/price', PriceHandler)]

app=webapp2.WSGIApplication(Routing)

