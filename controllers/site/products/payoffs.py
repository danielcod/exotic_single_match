from controllers.site.products import *

class IndexHandler(webapp2.RequestHandler):

    @validate_query({'league': '\\D{3}\\.\\d',
                     'team': '.*'})
    @emit_json_memcache(60)
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

Routing=[('/site/products/payoffs', IndexHandler)]

app=webapp2.WSGIApplication(Routing)

