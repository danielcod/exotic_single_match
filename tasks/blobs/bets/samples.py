from tasks.blobs.bets import *

# curl "http://localhost:8080/tasks/blobs/bets/samples?n=1"

class IndexHandler(webapp2.RequestHandler):

    @validate_query({'n': '\\d+'})
    @task
    def get(self):         
        n=int(self.request.get("n"))
        [taskqueue.add(url="/tasks/blobs/bets/samples/%s" % product["type"],
                       params={"n": n},
                       queue_name=QueueName)
         for product in Products]
        taskqueue.add(url="/tasks/blobs/bets/samples/reduce",
                      queue_name=QueueName)
        logging.info("%s tasks started" % (1+len(Products)))

class MiniLeagueHandler(webapp2.RequestHandler):

    @task
    def post(self):
        logging.info("mini_league")
    
class SeasonMatchBetHandler(webapp2.RequestHandler):

    @task
    def post(self):
        logging.info("season_match_bet")
    
class SingleTeamOutrightHandler(webapp2.RequestHandler):

    @task
    def post(self):
        logging.info("single_team_outright")

class ReduceHandler(webapp2.RequestHandler):

    @task
    def post(self):
        logging.info("reduce")
                    
Routing=[('/tasks/blobs/bets/samples/reduce', ReduceHandler),
         ('/tasks/blobs/bets/samples/mini_league', MiniLeagueHandler),
         ('/tasks/blobs/bets/samples/season_match_bet', SeasonMatchBetHandler),
         ('/tasks/blobs/bets/samples/single_team_outright', SingleTeamOutrightHandler),
         ('/tasks/blobs/bets/samples', IndexHandler)]

app=webapp2.WSGIApplication(Routing)
