from tasks.curation.products import *

class IndexHandler(webapp2.RequestHandler):

    def init_matchteams(self, allmatchteams, n):
        matchteams=[]
        for i in range(n):
            matchteams.append(pop_random_team(allmatchteams))
        return matchteams
    
    @validate_query({'n': '\\d+'})
    @task
    def post(self, cutoff=4, size=4):
        blob=Blob.get_by_key_name("app/match_teams")
        allmatchteams=[team for team in json_loads(blob.text)
                       if team["team"] in TopTeamNames]
        bets=[]        
        n=int(self.request.get("n"))
        for i in range(n):
            matchteams=list(allmatchteams)
            bet=ExoticAccaBet()
            bet.teams=json_dumps(self.init_matchteams(matchteams, size))
            bet.teams_condition=">"
            bet.n_teams=1
            bet.result="win"
            bet.goals_condition=">"
            bet.n_goals=1
            bet.price=format_price(bet.calc_probability())
            bets.append(bet.to_json())
        keyname="products/samples/exotic_acca"
        memcache.set(keyname, json_dumps(bets), MemcacheAge)
        logging.info("Saved %i exotic_acca" % len(bets))

Routing=[('/tasks/curation/products/exotic_accas', IndexHandler)]

app=webapp2.WSGIApplication(Routing)
