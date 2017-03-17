from tasks.bets.init import *

from models.bets.positions.single_team_outrights import SingleTeamOutrightBet

# curl "http://localhost:8080/tasks/bets/init/single_team_outrights?n=1"

class IndexHandler(webapp2.RequestHandler):

    @validate_query({'n': '\\d+'})
    @task
    def get(self):         
        leaguenames=[leaguename 
                     for leaguename in self.request.get("leagues").split(",")
                     if leaguename in Leagues.keys()]
        if leaguenames==[]:
            leaguenames=Leagues.keys()
        n=int(self.request.get("n"))
        [taskqueue.add(url="/tasks/bets/init/single_team_outrights/league",
                       params={"league": leaguename,
                               "n": n},
                       queue_name=QueueName)
         for leaguename in leaguenames]
        logging.info("%s league tasks started" % len(leaguenames))

class LeagueHandler(webapp2.RequestHandler):

    @task
    def post(self):
        leaguename=self.request.get("league")
        blob=Blob.get_by_key_name("outright_payoffs/%s" % leaguename)
        payoffs=json_loads(blob.text)
        n=int(self.request.get("n"))
        expiry=Expiries[-1] # NB
        for i in range(n):
            j=int(random.random()*len(payoffs))
            payoff=payoffs[j]
            price=format_price(payoff["probability"])
            SingleTeamOutrightBet(league=leaguename,
                                      team=payoff["team"],
                                      payoff=payoff["payoff"],
                                      expiry=expiry["value"],
                                      price=price).put()
        logging.info("Created %s SingleTeamOutright bets [%i]" % (leaguename, n))
        
Routing=[('/tasks/bets/init/single_team_outrights/league', LeagueHandler),
         ('/tasks/bets/init/single_team_outrights', IndexHandler)]

app=webapp2.WSGIApplication(Routing)