from tasks.curation.samples import *

from products.positions.single_team_outrights import calc_probability, description

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
        params={"league": payoff["league"],
                "team": payoff["team"],
                "payoff": payoff["payoff"],
                "expiry": EndOfSeason}
        bet={"type": "single_team_outright",
             "params": params,
             "probability": calc_probability(params),
             "description": description(params)}
        keyname="products/samples/single_team_outright/%i" % i
        memcache.set(keyname, json_dumps(bet), MemcacheAge)
        logging.info("Saved single_team_outright/%i" % i)

Routing=[('/tasks/curation/samples/single_team_outrights', IndexHandler)]

app=webapp2.WSGIApplication(Routing)
