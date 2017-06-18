from controllers.app import *

# curl -X POST "http://localhost:8080/app/bets/price" -d "foo=bar"

class PriceHandler(webapp2.RequestHandler):

    @emit_json
    def post(self):
        import random
        price=1/float(0.1+random.random()*0.8)
        return {"price": price}
        
Routing=[('/app/bets/price', PriceHandler)]

app=webapp2.WSGIApplication(Routing)

