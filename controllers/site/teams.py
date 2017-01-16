from controllers.site import *

class IndexHandler(webapp2.RequestHandler):

    @validate_query({'league': '^\\D{3}\\.\\d$'})
    @emit_json_memcache(60)
    def get(self):
        leaguename=self.request.get("league")
        leaguenames=[league["name"]
                     for league in Leagues]
        if leaguename not in leaguenames:
            raise RuntimeError("League not found")
        return [{"value": team["name"]}
                for team in yc_lite.get_teams(leaguename)]

Routing=[('/site/teams', IndexHandler)]

app=webapp2.WSGIApplication(Routing)

