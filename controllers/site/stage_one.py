from controllers.site import *

StageDeps=yaml.load("""
- js/app/stage_one.js
""")

class IndexHandler(webapp2.RequestHandler):

    def get(self):
        depsstr=",".join(["\"../%s\"" % dep
                          for dep in RootDeps+StageDeps])
        contracts=[contract.to_json()
                   for contract in Contract.find_all()]
        contracts=contracts[:5] # TEMP
        tv={"title": Title,
            "contracts": contracts,
            "deps": depsstr}
        render_template(self, "templates/site/stage_one.html", tv)

Routing=[('/site/stage_one', IndexHandler)]

app=webapp2.WSGIApplication(Routing)

