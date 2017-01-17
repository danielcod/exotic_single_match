from controllers import *

import apis.yc_lite_api as yc_lite

from helpers.expiry_helpers import init_expiries

from products.positions.single_teams import SingleTeamsProduct

Title="Team Exotics Demo"

Deps=yaml.load("""
- css/lib/bootstrap.min.css
- css/lib/jumbotron-narrow.css
- css/lib/bs-wizard.css
- js/lib/jquery.min.js
- js/lib/bootstrap.min.js
- js/lib/react.min.js
- js/lib/react-dom.min.js
- js/app/products/services.js
- js/app/products/components.js
- js/app/products/single_teams.js
- js/app/steps/browse_bets.js
- js/app/steps/edit_bet.js
- js/app/steps/place_bet.js
- js/app/app.js
""")

Products={
    "single_teams": SingleTeamsProduct,
}

Leagues=yaml.load(file("config/leagues.yaml").read())

MaxProb, MinProb, MinPrice, MaxPrice = 0.99, 0.01, 1.001, 100

class LeaguesHandler(webapp2.RequestHandler):

    @emit_json_memcache(60)
    def get(self):
        return [{"value": league["name"]}
                for league in Leagues]
    
class TeamsHandler(webapp2.RequestHandler):

    @validate_query({'league': '^\\D{3}\\.\\d$'})
    @emit_json_memcache(60)
    def get(self):
        leaguename=self.request.get("league")
        leaguenames=[league["name"]
                     for league in Leagues]
        if leaguename not in leaguenames:
            raise RuntimeError("League not found")
        return [{"value": team["name"]}
                for team in yc_lite.get_teams(leaguename)]

class ExpiriesHandler(webapp2.RequestHandler):
    
    @emit_json_memcache(60)
    def get(self, cutoffmonth=4):
        return init_expiries(cutoffmonth)

"""
- limited to 5 products until pagination/filtering can be employed
"""

class ListProductsHandler(webapp2.RequestHandler):

    @emit_json
    def get(self):
        products=Product.find_all()
        if products==[]:
            raise RuntimeError("No products found")
        products=[{"description": product.query,
                   "price": "%.3f" % (1/float(product.probability)),
                   "id": product.key().id()}
                  for product in products
                  if product.probability > 0]
        return products[:5] # NB
        
"""
- currently just returns a random product; change so is passed a product_id
"""
    
class ShowProductHandler(webapp2.RequestHandler):

    @emit_json
    def get(self):
        products=Product.find_all()
        if products==[]:
            raise RuntimeError("No products found")
        product=products[0]
        return {"type": product.product,
                "query": json_loads(product.query)}

class ProductPayoffsHandler(webapp2.RequestHandler):

    @validate_query({'league': '\\D{3}\\.\\d'})
    @emit_json
    def get(self):
        productname=self.request.get("product")
        if productname not in Products:
            raise RuntimeError("Product not found")
        product=Products[productname]()
        leaguename=self.request.get("league")
        payoffs=[{"value": payoff["name"]}
                 for payoff in product.init_payoffs(leaguename)]
        return payoffs

class ProductPriceHandler(webapp2.RequestHandler):

    @parse_json_body
    @emit_json
    def post(self, struct):
        productname, query = struct["product"], struct["query"]
        if productname not in Products:
            raise RuntimeError("Product not found")
        product=Products[productname]()
        payoffs=product.calc_price(query)
        probability=payoffs[0]["value"]
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
        return {"probability": probability,
                "decimal_price": format_price(probability)}

class IndexHandler(webapp2.RequestHandler):

    def get(self):
        depsstr=",".join(["\"../%s\"" % dep
                          for dep in Deps])
        tv={"title": Title,
            "deps": depsstr}
        render_template(self, "templates/app.html", tv)
    
Routing=[('/app/leagues', LeaguesHandler),
         ('/app/teams', TeamsHandler),
         ('/app/expiries', ExpiriesHandler),        
         ('/app/products/list', ListProductsHandler),
         ('/app/products/show', ShowProductHandler),
         ('/app/products/payoffs', ProductPayoffsHandler),
         ('/app/products/price', ProductPriceHandler),
         ('/app', IndexHandler)]

app=webapp2.WSGIApplication(Routing)

