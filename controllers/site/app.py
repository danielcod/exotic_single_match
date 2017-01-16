from controllers.site import *

AppDeps=yaml.load("""
- js/app/services.js
- js/app/components.js
- js/app/products/single_teams.js
- js/app/steps/edit_bet_step.js
- js/app/app.js
""")

ProductConfig=yaml.load("""
- label: Single Teams Outright
  name: single_teams
  description: An outright bet on a single team, but with dozens of payoffs per team - plus you don't have to wait until the end of the season!
""")

class InitHandler(webapp2.RequestHandler):

    @emit_json
    def get(self):
        contracts=Contract.find_all()
        if contracts==[]:
            raise RuntimeError("No contracts found")
        contract=contracts[0]
        product={"type": contract.product,
                 "query": json_loads(contract.query)}
        return {"products": ProductConfig,
                "product": product}

class IndexHandler(webapp2.RequestHandler):

    def get(self):
        depsstr=",".join(["\"../%s\"" % dep
                          for dep in RootDeps+AppDeps])
        tv={"title": Title,
            "deps": depsstr}
        render_template(self, "templates/site/app.html", tv)

Routing=[('/site/app/init', InitHandler),
         ('/site/app', IndexHandler)]

app=webapp2.WSGIApplication(Routing)

