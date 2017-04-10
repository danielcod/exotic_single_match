from controllers.app import *

from models.bets.positions.single_team_outrights import SingleTeamOutrightBet
from models.bets.positions.season_match_bets import SeasonMatchBet
from models.bets.positions.mini_leagues import MiniLeagueBet
from models.bets.goals.exotic_accas import ExoticAccaBet

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

class PriceHandler(webapp2.RequestHandler):

    @parse_json_body
    # @emit_json_memcache(MemcacheAge)
    @emit_json
    def post(self, struct):
        # logging.info(struct) # TEMP
        bettype=struct.pop("type")
        products=dict([(product["type"], eval(product["class"]))
                       for product in Products])
        if bettype not in products:
            raise RuntimeError("Product not found")
        bet=products[bettype].from_json(struct)
        probability=bet.calc_probability()
        return {"price": format_price(probability),
                "description": bet.description}

Routing=[('/app/bets/price', PriceHandler)]

app=webapp2.WSGIApplication(Routing)

