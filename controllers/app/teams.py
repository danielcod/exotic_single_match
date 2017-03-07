from controllers.app import *

# curl "http://localhost:8080/app/teams?league=ENG.1"
    
class IndexHandler(webapp2.RequestHandler):

    def get_all_teams(self):
        teams=[]
        for league in Leagues:
            teams+=yc_lite.get_teams(league["name"])
        return teams
    
    def get_teams(self, leaguename):
        leaguenames=[league["name"]
                     for league in Leagues]
        if leaguename not in leaguenames:
            raise RuntimeError("League not found")
        return yc_lite.get_teams(leaguename)
    
    @validate_query({'league': '^(\\D{3}\\.\\d)|(All)$'})
    @emit_json_memcache(MemcacheAge)
    def get(self):
        leaguename=self.request.get("league")
        if leaguename==All:
            return self.get_all_teams()
        else:
            return self.get_teams(leaguename)

Routing=[('/app/teams', IndexHandler)]

app=webapp2.WSGIApplication(Routing)

