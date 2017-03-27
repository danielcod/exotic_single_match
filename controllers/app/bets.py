from controllers.app import *

from models.bets.positions.single_team_outrights import SingleTeamOutrightBet
from models.bets.positions.season_match_bets import SeasonMatchBet
from models.bets.positions.mini_leagues import MiniLeagueBet

MaxProb, MinProb, MinPrice, MaxPrice = 0.99, 0.01, 1.001, 100

def format_price(probability):
    if probability < MinProb:
        price=MaxPrice
    elif probability > MaxProb:
        price=MinPrice
    else:
        price=1/float(probability)
    if price < 2:
        return "%.3f" % price
    elif price < 5:
        return "%.2f" % price
    else:
        return "%.1f" % price

"""
- this should be replaced by series of tasks generating interesting blobs
"""
    
class ListHandler(webapp2.RequestHandler):

    @emit_json_memcache(MemcacheAge)
    def get(self):
        return []

class PriceHandler(webapp2.RequestHandler):

    @parse_json_body
    # @emit_json_memcache(MemcacheAge)
    @emit_json
    def post(self, struct):
        bettype, betparams = struct["type"], struct["bet"]
        products=dict([(product["type"], eval(product["class"]))
                       for product in Products])
        if bettype not in products:
            raise RuntimeError("Product not found")
        bet=products[bettype].from_json(betparams)
        probability=bet.calc_probability()
        return {"price": format_price(probability),
                "description": bet.description}

Routing=[('/app/bets/list', ListHandler),
         ('/app/bets/price', PriceHandler)]

app=webapp2.WSGIApplication(Routing)

