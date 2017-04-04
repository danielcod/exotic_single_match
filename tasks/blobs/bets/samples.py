from tasks.blobs.bets import *

import random

# curl "http://localhost:8080/tasks/blobs/bets/samples?n=1"s started" % (1+len(Products)))

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

class ExoticAccaHandler(webapp2.RequestHandler):

    @validate_query({'n': '\\d+'})
    @task
    def post(self):
        bets=[]
        keyname="bets/samples/exotic_acca_bet"
        memcache.set(keyname, json_dumps(bets), MemcacheAge)
        logging.info("Saved %i exotic_acca_bet" % len(bets))

class MiniLeagueHandler(webapp2.RequestHandler):

    def load_teams(self, leaguenames, cutoff):
        teams=[]
        for leaguename in leaguenames:
            teams+=sorted(yc_lite.get_teams(leaguename),
                          key=lambda x: -x["expected_season_points"])[:cutoff]
        return teams
    
    @validate_query({'n': '\\d+'})
    @task
    def post(self,
             leaguenames=["ENG.1",
                          "FRA.1"
                          "GER.1",                                
                          "ITA.1",
                          "SPA.1"],
             cutoff=4,
             size=4):
        allteams=self.load_teams(leaguenames, cutoff)
        bets=[]
        n=int(self.request.get("n"))
        for i in range(n):
            teams=list(allteams)
            k=int(random.random()*len(teams))
            team=teams.pop(k)
            bet=MiniLeagueBet()
            bet.league=team["league"]
            bet.team=team["name"]
            versus=[]
            for j in range(size-1):
                k=int(random.random()*len(teams))
                team=teams.pop(k)
                versus.append({"league": team["league"],
                               "team": team["name"]})
            bet.versus=json_dumps(versus)
            if random.random() > 0.5:
                bet.payoff="Winner"
            else:
                bet.payoff="Bottom"
            bet.expiry=EndOfSeason
            """
            need to calculate price here as there's no pre- calculated surface from which you can borrow probability
            """
            bet.price=format_price(0.1+random.random()*0.8) # TEMP
            bets.append(bet.to_json())
        keyname="bets/samples/mini_league"
        memcache.set(keyname, json_dumps(bets), MemcacheAge)
        logging.info("Saved %i mini_league" % len(bets))
        
class SeasonMatchBetHandler(webapp2.RequestHandler):

    @validate_query({'n': '\\d+'})
    @task
    def post(self):
        blob=Blob.get_by_key_name("bets/smb_versus")
        teams=json_loads(blob.text)
        n=int(self.request.get("n"))
        bets=[]
        for i in range(n):
            j=int(random.random()*len(teams))
            team=teams[j]
            price=format_price(team["probability"])
            bet=SeasonMatchBet(league=team["league"],
                               team=team["team"],
                               versus=team["versus"],
                               expiry=EndOfSeason,
                               price=price)
            bets.append(bet.to_json())
        keyname="bets/samples/season_match_bet"
        memcache.set(keyname, json_dumps(bets), MemcacheAge)
        logging.info("Saved %i season_match_bet" % len(bets))
        
class SingleTeamOutrightHandler(webapp2.RequestHandler):

    @validate_query({'n': '\\d+'})
    @task
    def post(self):
        blob=Blob.get_by_key_name("bets/outright_payoffs")
        payoffs=json_loads(blob.text)
        n=int(self.request.get("n"))
        bets=[]
        for i in range(n):
            j=int(random.random()*len(payoffs))
            payoff=payoffs[j]
            price=format_price(payoff["probability"])
            bet=SingleTeamOutrightBet(league=payoff["league"],
                                      team=payoff["team"],
                                      payoff=payoff["payoff"],
                                      expiry=EndOfSeason,
                                      price=price)
            bets.append(bet.to_json())
        keyname="bets/samples/single_team_outright"
        memcache.set(keyname, json_dumps(bets), MemcacheAge)
        logging.info("Saved %i single_team_outright" % len(bets))

class ReduceHandler(webapp2.RequestHandler):

    @task
    def post(self):
        bets=[]
        for product in Products:
            keyname="bets/samples/%s" % product["type"]
            resp=memcache.get(keyname)
            if resp in ['', None, []]:
                continue
            bets+=json_loads(resp)
        logging.info("Total %i samples" % len(bets))
        Blob(key_name="bets/samples",
             text=json_dumps(bets),
             timestamp=datetime.datetime.now()).put()
        logging.info("Saved to /bets/samples")
        
Routing=[('/tasks/blobs/bets/samples/reduce', ReduceHandler),
         ('/tasks/blobs/bets/samples/exotic_acca', ExoticAccaHandler),
         ('/tasks/blobs/bets/samples/mini_league', MiniLeagueHandler),
         ('/tasks/blobs/bets/samples/season_match_bet', SeasonMatchBetHandler),
         ('/tasks/blobs/bets/samples/single_team_outright', SingleTeamOutrightHandler),
         ('/tasks/blobs/bets/samples', IndexHandler)]

app=webapp2.WSGIApplication(Routing)
