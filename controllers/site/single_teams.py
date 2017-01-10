from controllers.site import *

from products.positions.single_teams import SingleTeamsProduct

Deps=yaml.load("""
- css/lib/bootstrap.min.css
- css/lib/jumbotron-narrow.css
- css/lib/bs-wizard.css
- js/lib/jquery.min.js
- js/lib/bootstrap.min.js
- js/lib/react.min.js
- js/lib/react-dom.min.js
- js/app/exotics_engine.js
""")

Title="ioSport Exotics Demo"

DefaultPayoffValue="Winner"

class PayoffHandler(webapp2.RequestHandler):

    @validate_query({'league': '\\D{3}\\.\\d'})
    @emit_json
    def get(self):
        leaguename=self.request.get("league")
        product=SingleTeamsProduct()
        payoffs=[{"name": name}
                 for name in product.payoff_names(leaguename)]
        for payoff in payoffs:
            if payoff["name"]==DefaultPayoffName:
                payoff["selected"]=True
        return payoffs

class IndexHandler(webapp2.RequestHandler):

    def get(self):
        depsstr=",".join(["\"../%s\"" % dep
                         for dep in Deps])
        tv={"title": Title,
            "deps": depsstr}
        render_template(self, "templates/site/single_teams.html", tv)

Routing=[('/site/single_teams/payoff', PayoffHandler),
         ('/site/single_teams', IndexHandler)]

app=webapp2.WSGIApplication(Routing)

