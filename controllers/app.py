from controllers import *

import apis.yc_lite_api as yc_lite

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

Title="Team Exotics Demo"

Leagues=yaml.load(file("config/leagues.yaml").read())

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

class IndexHandler(webapp2.RequestHandler):

    def get(self):
        depsstr=",".join(["\"../%s\"" % dep
                          for dep in Deps])
        tv={"title": Title,
            "deps": depsstr}
        render_template(self, "templates/app.html", tv)

Routing=[('/app/products/list', ListProductsHandler),
         ('/app/products/show', ShowProductHandler),
         ('/app', IndexHandler)]

app=webapp2.WSGIApplication(Routing)

