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
    
    @validate_query({'i': '\\d+'})
    @task
    def post(self, cutoff=4, size=4):
        i=int(self.request.get("i"))
        blob=Blob.get_by_key_name("app/match_teams")
        teams=[team for team in json_loads(blob.text)
               if team["team"] in TopTeamNames]
        bet=ExoticAccaBet()
        bet.teams=json_dumps(self.init_teams(teams, size))
        bet.teams_condition=">"
        bet.n_teams=1
        bet.result="win"
        bet.goals_condition=">"
        bet.n_goals=1
        bet.price=format_price(bet.calc_probability())
        keyname="products/samples/exotic_acca/%s" % i
        memcache.set(keyname, json_dumps(bet.to_json()), MemcacheAge)
        logging.info("Saved exotic_acca/%i" % i)

Routing=[('/tasks/curation/products/exotic_accas', IndexHandler)]

app=webapp2.WSGIApplication(Routing)
