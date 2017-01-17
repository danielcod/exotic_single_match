from controllers.site import *

AppDeps=yaml.load("""
- js/app/products/services.js
- js/app/products/components.js
- js/app/products/single_teams.js
- js/app/steps/browse_bets.js
- js/app/steps/edit_bet.js
- js/app/steps/place_bet.js
- js/app/app.js
""")

"""
- limited to 5 contracts until pagination/filtering can be employed
"""

class ListHandler(webapp2.RequestHandler):

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
    
class ShowHandler(webapp2.RequestHandler):

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
                          for dep in RootDeps+AppDeps])
        tv={"title": Title,
            "deps": depsstr}
        render_template(self, "templates/site/app.html", tv)

Routing=[('/site/app/list', ListHandler),
         ('/site/app/show', ShowHandler),
         ('/site/app', IndexHandler)]

app=webapp2.WSGIApplication(Routing)

