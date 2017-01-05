from controllers.api import *

import apis.yc_lite_api as yclite

# curl "http://localhost:8080/api/teams?league=ENG.1"

class IndexHandler(webapp2.RequestHandler):

    @validate_query({'league': '^\\D{3}\\.\\d$'})
    @emit_json
    def get(self):
        leaguename=self.request.get("league")
        return yclite.get_teams(leaguename)

Routing=[('/api/teams', IndexHandler)]

app=webapp2.WSGIApplication(Routing)
