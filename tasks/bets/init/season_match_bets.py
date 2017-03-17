from tasks.bets.init import *

from models.bets.positions.season_match_bets import SeasonMatchBet

# curl "http://localhost:8080/tasks/bets/init/season_match_bets?n=1"

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
        [taskqueue.add(url="/tasks/bets/init/season_match_bets/league",
                       params={"league": leaguename,
                               "n": n},
                       queue_name=QueueName)
         for leaguename in leaguenames]
        logging.info("%s league tasks started" % len(leaguenames))

class LeagueHandler(webapp2.RequestHandler):

    @task
    def post(self):
        leaguename=self.request.get("league")
        blob=Blob.get_by_key_name("smb_versus/%s" % leaguename)
        teams=json_loads(blob.text)
        n=int(self.request.get("n"))
        expiry=Expiries[-1] # NB
        for i in range(n):
            j=int(random.random()*len(teams))
            team=teams[j]
            price=format_price(team["probability"])
            SeasonMatchBet(league=leaguename,
                                  team=team["team"],
                                  versus=team["versus"],
                                  expiry=expiry["value"],
                                  price=price).put()
        logging.info("Created %s SeasonMatchBet bets [%i]" % (leaguename, n))
        
Routing=[('/tasks/bets/init/season_match_bets/league', LeagueHandler),
         ('/tasks/bets/init/season_match_bets', IndexHandler)]

app=webapp2.WSGIApplication(Routing)



