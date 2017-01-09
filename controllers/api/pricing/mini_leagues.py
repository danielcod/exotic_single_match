from controllers.api.pricing import *

class PayoffHandler(webapp2.RequestHandler):

    @emit_json
    def get(self):
        return [{"name": name}
                for name in ["Winner", "Bottom"]]

Routing=[('/api/pricing/mini_leagues/payoff', PayoffHandler),
         ('/api/pricing/mini_leagues/price', PriceHandler)]

app=webapp2.WSGIApplication(Routing)
