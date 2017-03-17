from controllers.app import *

from models.bets.positions.single_team_outrights import SingleTeamOutrightBet
from models.bets.positions.season_match_bets import SeasonMatchBet
from models.bets.positions.mini_leagues import MiniLeagueBet

from helpers.price_helpers import format_price

Products=yaml.load(file("config/products.yaml").read())

class IndexHandler(webapp2.RequestHandler):

    @emit_json_memcache(MemcacheAge)
    def get(self):
        return Products

class ListHandler(webapp2.RequestHandler):

    def load_bets_db(self):
        bets=[]
        bets+=SingleTeamOutrightBet.find_all()
        bets+=SeasonMatchBet.find_all()
        bets+=MiniLeagueBet.find_all()
        return [bet.to_json()
                for bet in bets]

    def load_bets_memcache(self):
        resp=memcache.get("bets")
        if resp in ['', None, []]:
            return None
        return json_loads(resp)

    def save_bets_memcache(self, bets, age=60):
        memcache.set("bets", json_dumps(bets), age)
    
    def load_bets(self):
        bets=self.load_bets_memcache()
        if bets!=None:
            logging.info("Serving bets from memcache")
            return bets
        logging.info("Loading bets from DB")
        bets=self.load_bets_db()
        self.save_bets_memcache(bets)
        return bets
            
    @emit_json_memcache(MemcacheAge)
    def get(self):
        return self.load_bets()

class ShowHandler(webapp2.RequestHandler):

    @validate_query({'type': '.+',
                     'id': '^\\d+'})
    @emit_json_memcache(MemcacheAge)
    def get(self):
        bettype=self.request.get("type")
        betmapping=dict([(bet["type"], eval(bet["class"]))
                      for bet in Products])
        if bettype not in betmapping:
            raise RuntimeError("Bet not found")
        id=int(self.request.get("id"))
        bet=betmapping[bettype].get_by_id(id)
        if not bet:
            raise RuntimeError("Bet not found")
        return bet.to_json()

class PriceHandler(webapp2.RequestHandler):

    @parse_json_body
    # @emit_json_memcache(MemcacheAge)
    @emit_json
    def post(self, struct):
        bettype, betparams = struct["type"], struct["bet"]
        products=dict([(bet["type"], eval(bet["class"]))
                       for bet in Products])
        if product not in products:
            raise RuntimeError("Product not found")
        bet=products[bettype].from_json(betparams)
        probability=bet.calc_probability()
        return {"price": format_price(probability),
                "description": bet.description}

Routing=[('/app/bets/list', ListHandler),
         ('/app/bets/show', ShowHandler),
         ('/app/bets/price', PriceHandler),
         ('/app/bets', IndexHandler)]

app=webapp2.WSGIApplication(Routing)

