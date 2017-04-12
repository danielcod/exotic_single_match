from tasks.curation.samples import *

from products.positions.mini_leagues import calc_probability, description

class IndexHandler(webapp2.RequestHandler):

    def pop_random_team(self, teams):
        i=int(random.random()*len(teams))
        return teams.pop(i)   
    
    def init_versus(self, teams, n):
        versus=[]
        for i in range(n):
            team=self.pop_random_team(teams)
            versus.append({"league": team["league"],
                           "team": team["name"]})
        return versus
            
    def init_payoff(self):
        return "Winner" if random.random() > 0.5 else "Bottom"
        
    @validate_query({'i': '\\d+'})
    @task
    def post(self, cutoff=4, size=4):
        i=int(self.request.get("i"))
        teams=list(TopTeams)
        team=self.pop_random_team(teams)
        bet={"league": team["league"],
             "team": team["name"],
             "versus": self.init_versus(teams, size-1),
             "payoff": self.init_payoff(),
             "expiry": EndOfSeason}
        bet["type"]="mini_league"
        bet["price"]=format_price(calc_probability(bet))
        bet["description"]=description(bet)
        keyname="products/samples/mini_league/%i" % i
        memcache.set(keyname, json_dumps(bet), MemcacheAge)
        logging.info("Saved mini_league/%i" % i)
        
Routing=[('/tasks/curation/samples/mini_leagues', IndexHandler)]

app=webapp2.WSGIApplication(Routing)
