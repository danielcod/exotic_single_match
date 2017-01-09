from controllers.api.pricing import *

class PayoffHandler(webapp2.RequestHandler):

    @validate_query({'league': '\\D{3}\\.\\d'})
    @emit_json
    def get(self):
        leaguename=self.request.get("league")
        product=SingleTeamsProduct()
        return [{"name": name}
                for name in product.payoff_names(leaguename)]

Routing=[('/api/pricing/single_teams/payoff', PayoffHandler),
         ('/api/pricing/single_teams/price', PriceHandler)]

app=webapp2.WSGIApplication(Routing)
