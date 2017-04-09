from tasks.curation.products import *

class IndexHandler(webapp2.RequestHandler):

    def init_versus(self, teams, n):
        versus=[]
        for i in range(n):
            team=pop_random_team(teams)
            versus.append({"league": team["league"],
                           "team": team["name"]})
        return versus
            
    def init_payoff(self):
        return "Winner" if random.random() > 0.5 else "Bottom"
        
    @validate_query({'n': '\\d+'})
    @task
    def post(self, cutoff=4, size=4):
        bets=[]
        n=int(self.request.get("n"))
        for i in range(n):
            teams=list(TopTeams)
            team=pop_random_team(teams)
            bet=MiniLeagueBet()
            bet.league=team["league"]
            bet.team=team["name"]
            bet.versus=json_dumps(self.init_versus(teams, size-1))
            bet.payoff=self.init_payoff()
            bet.expiry=EndOfSeason
            """
            need to calculate price here as there's no pre- calculated surface from which you can borrow probability
            """
            bet.price=format_price(bet.calc_probability())
            bets.append(bet.to_json())
        keyname="bets/samples/mini_league"
        memcache.set(keyname, json_dumps(bets), MemcacheAge)
        logging.info("Saved %i mini_league" % len(bets))
        
Routing=[('/tasks/curation/products/mini_leagues', IndexHandler)]

app=webapp2.WSGIApplication(Routing)
