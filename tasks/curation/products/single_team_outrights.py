from tasks.curation.products import *

class IndexHandler(webapp2.RequestHandler):

    @validate_query({'n': '\\d+'})
    @task
    def post(self):
        blob=Blob.get_by_key_name("bets/outright_payoffs")
        payoffs=[team for team in json_loads(blob.text)
                 if team["team"] in TopTeamNames]
        n=int(self.request.get("n"))
        bets=[]
        for i in range(n):
            j=int(random.random()*len(payoffs))
            payoff=payoffs[j]
            """
            borrow price from pre- calculated outright_payoff probability
            """
            price=format_price(payoff["probability"])
            bet=SingleTeamOutrightBet(league=payoff["league"],
                                      team=payoff["team"],
                                      payoff=payoff["payoff"],
                                      expiry=EndOfSeason,
                                      price=price)
            bets.append(bet.to_json())
        keyname="bets/samples/single_team_outright"
        memcache.set(keyname, json_dumps(bets), MemcacheAge)
        logging.info("Saved %i single_team_outright" % len(bets))

Routing=[('/tasks/curation/products/single_team_outrights', IndexHandler)]

app=webapp2.WSGIApplication(Routing)
