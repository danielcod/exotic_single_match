from tasks.curation.products import *

class IndexHandler(webapp2.RequestHandler):

    @validate_query({'i': '\\d+'})
    @task
    def post(self):
        i=int(self.request.get("i"))
        blob=Blob.get_by_key_name("products/outright_payoffs")
        payoffs=[team for team in json_loads(blob.text)
                 if team["team"] in TopTeamNames]
        j=int(random.random()*len(payoffs))
        payoff=payoffs[j]
        price=format_price(payoff["probability"])
        bet=SingleTeamOutrightBet(league=payoff["league"],
                                  team=payoff["team"],
                                  payoff=payoff["payoff"],
                                  expiry=EndOfSeason,
                                  price=price)
        keyname="products/samples/single_team_outright/%i" % i
        memcache.set(keyname, json_dumps(bet.to_json()), MemcacheAge)
        logging.info("Saved single_team_outright/%i" % i)

Routing=[('/tasks/curation/products/single_team_outrights', IndexHandler)]

app=webapp2.WSGIApplication(Routing)
