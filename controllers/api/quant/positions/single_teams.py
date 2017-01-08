from controllers.api.quant.positions import *

# curl "http://localhost:8080/api/quant/positions/single_teams/payoff?league=ENG.1"

class PayoffHandler(webapp2.RequestHandler):

    @validate_query({'league': '\\D{3}\\.\\d'})
    @emit_json
    def get(self):
        leaguename=self.request.get("league")
        teams=yc_lite.get_teams(leaguename)
        if teams==[]:
            raise RuntimeError("No teams found")
        names=[]
        # Winner
        names.append(Winner)
        # Top X
        for i in range(2, 1+len(teams)/2):
            names.append("Top %i" % i)
        # Bottom
        names.append(Bottom)
        # Bottom X
        for i in range(2, 1+len(teams)/2):
            names.append("Bottom %i" % i)
        # X Place
        for i in range(2, len(teams)):
            names.append("%i%s Place" % (i, cardinal_suffix(i)))
        # return
        return [{"name": name}
                for name in names]

# curl -X POST "http://localhost:8080/api/quant/positions/single_teams/price" -d "{\"league\": \"ENG.1\", \"team\": \"Chelsea\", \"payoff\": \"Winner\", \"expiry\": \"2017-03-01\"}"
    
class PriceHandler(webapp2.RequestHandler):

    @parse_json_body
    @emit_json
    def post(self, req):
        allteams=yc_lite.get_teams(req["league"])
        allresults=yc_lite.get_results(req["league"])
        allfixtures=Event.fetch_fixtures(req["league"])
        expiry=init_expiry_date(allfixtures, req["expiry"])
        fixtures=[fixture for fixture in allfixtures
                  if (fixture["date"] > Today and
                      fixture["date"] <= expiry)]
        index=parse_payoff_index(req["payoff"])
        env={"teams": allteams,
             "results": allresults,
             "fixtures": fixtures,
             "index": index}
        probability=calc_probability(env, req["team"])
        return {"decimal_price": format_price(probability)}

Routing=[('/api/quant/positions/single_teams/payoff', PayoffHandler),
         ('/api/quant/positions/single_teams/price', PriceHandler)]

app=webapp2.WSGIApplication(Routing)
