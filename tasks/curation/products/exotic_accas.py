from tasks.curation.products import *

class IndexHandler(webapp2.RequestHandler):

    def pop_random_team(self, teams):
        i=int(random.random()*len(teams))
        return teams.pop(i)   
    
    def init_teams(self, allteams, n):
        teams=[]
        for i in range(n):
            teams.append(self.pop_random_team(allteams))
        return teams
    
    @validate_query({'n': '\\d+'})
    @task
    def post(self, cutoff=4, size=4):
        blob=Blob.get_by_key_name("app/match_teams")
        allteams=[team for team in json_loads(blob.text)
                  if team["team"] in TopTeamNames]
        bets=[]        
        n=int(self.request.get("n"))
        for i in range(n):
            teams=list(allteams)
            bet=ExoticAccaBet()
            bet.teams=json_dumps(self.init_teams(teams, size))
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
