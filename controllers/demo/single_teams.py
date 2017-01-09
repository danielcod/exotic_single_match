from controllers.demo import *

from products.positions.single_teams import SingleTeamsProduct

class PayoffHandler(webapp2.RequestHandler):

    @validate_query({'league': '\\D{3}\\.\\d'})
    @emit_json
    def get(self):
        leaguename=self.request.get("league")
        product=SingleTeamsProduct()
        return [{"name": name}
                for name in product.payoff_names(leaguename)]
    
class IndexHandler(webapp2.RequestHandler):

    def get(self):
        render_template(self, "templates/demo/single_teams.html", {})

Routing=[('/demo/single_teams/payoff', PayoffHandler),
         ('/demo/single_teams', IndexHandler)]

app=webapp2.WSGIApplication(Routing)

