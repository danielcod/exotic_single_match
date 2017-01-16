from tasks.random import *

# curl "http://localhost:8080/tasks/random/single_teams?n=3"

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
        logging.info("random")

Routing=[('/tasks/random/single_teams/init', InitHandler),
         ('/tasks/random/single_teams', IndexHandler)]

app=webapp2.WSGIApplication(Routing)
