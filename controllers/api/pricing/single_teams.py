from controllers.api.pricing import *

Routing=[('/api/pricing/single_teams/price', PriceHandler)]

app=webapp2.WSGIApplication(Routing)
