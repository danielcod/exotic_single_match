from tasks.blobs.bets import *

import random

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

    @validate_query({'n': '\\d+'})
    @task
    def post(self):
        logging.info("mini_league")
    
class SeasonMatchBetHandler(webapp2.RequestHandler):

    @validate_query({'n': '\\d+'})
    @task
    def post(self):
        blob=Blob.get_by_key_name("bets/smb_versus")
        teams=json_loads(blob.text)
        n=int(self.request.get("n"))
        for i in range(n):
            j=int(random.random()*len(teams))
            team=teams[j]
            price=format_price(team["probability"])
            bet=SeasonMatchBet(league=team["league"],
                               team=team["team"],
                               versus=team["versus"],
                               expiry=EndOfSeason,
                               price=price)
            logging.info(bet.to_json())

class SingleTeamOutrightHandler(webapp2.RequestHandler):

    @validate_query({'n': '\\d+'})
    @task
    def post(self):
        blob=Blob.get_by_key_name("bets/outright_payoffs")
        payoffs=json_loads(blob.text)
        n=int(self.request.get("n"))
        for i in range(n):
            j=int(random.random()*len(payoffs))
            payoff=payoffs[j]
            price=format_price(payoff["probability"])
            bet=SingleTeamOutrightBet(league=payoff["league"],
                                      team=payoff["team"],
                                      payoff=payoff["payoff"],
                                      expiry=EndOfSeason,
                                      price=price)
            logging.info(bet.to_json())

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
