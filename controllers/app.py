from controllers import *

from products.positions.single_teams import SingleTeamsProduct

import apis.yc_lite_api as yc_lite

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

"""
- limited to 5 contracts until pagination/filtering can be employed
"""

class ListProductsHandler(webapp2.RequestHandler):

    @emit_json
    def get(self):
        contracts=Contract.find_all()
        if contracts==[]:
            raise RuntimeError("No contracts found")
        contracts=[{"description": contract.query,
                    "price": "%.3f" % (1/float(contract.probability)),
                    "id": contract.key().id()}
                   for contract in contracts]
        return contracts[:5] # NB
        
"""
- currently just returns a random contract
- change so is passed a product_id
- rename as 'Show'
- move contract definitions to client side
"""
    
class ShowProductHandler(webapp2.RequestHandler):

    @emit_json
    def get(self):
        contracts=Contract.find_all()
        if contracts==[]:
            raise RuntimeError("No contracts found")
        contract=contracts[0]
        return {"type": contract.product,
                "query": json_loads(contract.query)}

class ProductPayoffsHandler(webapp2.RequestHandler):

    @validate_query({'league': '\\D{3}\\.\\d',
                     'team': '.*'})
    @emit_json
    def get(self):
        productname=self.request.get("product")
        leaguename=self.request.get("league")
        teamname=self.request.get("team")
        if teamname in ['', []]:
            teamname=None
        if productname not in Products:
            raise RuntimeError("Product not found")
        product=Products[productname]()
        def format_payoff(payoff):
            item={}
            item["value"]=payoff["name"]
            if "value" in payoff:
                item["probability"]=payoff["value"]
            return item
        payoffs=[format_payoff(payoff)
                 for payoff in product.init_payoffs(leaguename, teamname)]
        return payoffs

class ProductPriceHandler(webapp2.RequestHandler):

    @parse_json_body
    @emit_json
    def post(self, struct):
        productname, query = struct["product"], struct["query"]
        if productname not in Products:
            raise RuntimeError("Product not found")
        product=Products[productname]()
        contract=product.init_contract(query)        
        payoffs=product.price_contract(contract)
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

class LeaguesHandler(webapp2.RequestHandler):

    @emit_json_memcache(60)
    def get(self):
        return [{"value": league["name"]}
                for league in Leagues]
    
class IndexHandler(webapp2.RequestHandler):

    def get(self):
        depsstr=",".join(["\"../%s\"" % dep
                          for dep in Deps])
        tv={"title": Title,
            "deps": depsstr}
        render_template(self, "templates/app.html", tv)

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
        
Routing=[('/app/products/list', ListProductsHandler),
         ('/app/products/show', ShowProductHandler),
         ('/app/products/payoffs', ProductPayoffsHandler),
         ('/app/products/price', ProductPriceHandler),
         ('/app/leagues', LeaguesHandler),
         ('/app/teams', TeamsHandler),
         ('/app', IndexHandler)]

app=webapp2.WSGIApplication(Routing)

