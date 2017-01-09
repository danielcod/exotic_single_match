from controllers.api.pricing import *

Routing=[('/api/pricing/mini_leagues/price', PriceHandler)]

app=webapp2.WSGIApplication(Routing)
