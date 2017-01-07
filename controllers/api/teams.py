from controllers.api import *

import apis.yc_lite_api as yclite

Leagues=yaml.load(file("config/leagues.yaml").read())

# curl "http://localhost:8080/api/teams?league=ENG.1"

class IndexHandler(webapp2.RequestHandler):

    @validate_query({'league': '^\\D{3}\\.\\d$'})
    @emit_json_memcache(60)
    def get(self):
        leaguename=self.request.get("league")
        leaguenames=[league["name"]
                     for league in Leagues]
        if leaguename not in leaguenames:
            raise RuntimeError("League not found")
        return [{"name": team["name"]}
                for team in yclite.get_teams(leaguename)]

Routing=[('/api/teams', IndexHandler)]

app=webapp2.WSGIApplication(Routing)
