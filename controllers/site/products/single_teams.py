from controllers.site.products import *

from products.positions.single_teams import SingleTeamsProduct

class PayoffHandler(webapp2.RequestHandler):

    @validate_query({'league': '\\D{3}\\.\\d'})
    @emit_json_memcache(60)
    def get(self):
        leaguename=self.request.get("league")
        product=SingleTeamsProduct()
        payoffs=[{"value": name}
                 for name in product.payoff_names(leaguename)]
        return payoffs

Routing=[('/site/products/single_teams/payoff', PayoffHandler)]

app=webapp2.WSGIApplication(Routing)

