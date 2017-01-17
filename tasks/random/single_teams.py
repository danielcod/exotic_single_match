from tasks.random import *

ProductName="single_teams"

# curl "http://localhost:8080/tasks/random/single_teams?n=5"

class IndexHandler(webapp2.RequestHandler):

    @validate_query({'n': '\\d+'})
    @task
    def get(self):
        n=int(self.request.get("n"))
        tasks=[taskqueue.add(url="/tasks/random/single_teams/init")
               for i in range(n)]
        logging.info("%s league tasks started" % n)

class InitHandler(webapp2.RequestHandler):

    @task
    def post(self):
        random.seed(random_seed())
        i=int(len(Leagues)*random.random())
        leaguename=Leagues[i]["name"]
        teams=yc_lite.get_teams(leaguename)
        i=int(len(teams)*random.random())
        teamname=teams[i]["name"]
        logging.info(leaguename+"/"+teamname)
        
Routing=[('/tasks/random/single_teams/init', InitHandler),
         ('/tasks/random/single_teams', IndexHandler)]

app=webapp2.WSGIApplication(Routing)
