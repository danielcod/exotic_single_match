from tasks.curation import *

import random

def load_top_teams(cutoff=4):
    leaguenames=[leaguename for leaguename in Leagues.keys()
                 if leaguename.endswith(".1")]    
    teams=[]
    for leaguename in leaguenames:
        teams+=sorted(yc_lite.get_teams(leaguename),
                      key=lambda x: -x["expected_season_points"])[:cutoff]
    return teams

TopTeams=load_top_teams()

TopTeamNames=[team["name"] for team in TopTeams]

def pop_random_team(teams):
    i=int(random.random()*len(teams))
    return teams.pop(i)        

# curl "http://localhost:8080/tasks/curation/samples?n=1"

class IndexHandler(webapp2.RequestHandler):
 
    @validate_query({'n': '\\d+'})
    @task
    def get(self):         
        n=int(self.request.get("n"))
        [taskqueue.add(url="/tasks/curation/samples/%s" % product["type"],
                       params={"n": n},
                       queue_name=QueueName)
         for product in Products]
        taskqueue.add(url="/tasks/curation/samples/reduce",
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

    def init_versus(self, teams, n):
        versus=[]
        for i in range(n):
            team=pop_random_team(teams)
            versus.append({"league": team["league"],
                           "team": team["name"]})
        return versus
            
    def init_payoff(self):
        return "Winner" if random.random() > 0.5 else "Bottom"
        
    @validate_query({'n': '\\d+'})
    @task
    def post(self, cutoff=4, size=4):
        bets=[]
        n=int(self.request.get("n"))
        for i in range(n):
            teams=list(TopTeams)
            team=pop_random_team(teams)
            bet=MiniLeagueBet()
            bet.league=team["league"]
            bet.team=team["name"]
            bet.versus=json_dumps(self.init_versus(teams, size-1))
            bet.payoff=self.init_payoff()
            bet.expiry=EndOfSeason
            """
            need to calculate price here as there's no pre- calculated surface from which you can borrow probability
            """
            bet.price=format_price(bet.calc_probability())
            bets.append(bet.to_json())
        keyname="bets/samples/mini_league"
        memcache.set(keyname, json_dumps(bets), MemcacheAge)
        logging.info("Saved %i mini_league" % len(bets))
        
class SeasonMatchBetHandler(webapp2.RequestHandler):

    @validate_query({'n': '\\d+'})
    @task
    def post(self):
        blob=Blob.get_by_key_name("bets/smb_versus")
        teams=[team for team in json_loads(blob.text)
               if team["team"] in TopTeamNames]
        n=int(self.request.get("n"))
        bets=[]
        for i in range(n):
            j=int(random.random()*len(teams))
            team=teams[j]
            """
            borrow price from pre- calculated smb_versus probability
            """
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
        payoffs=[team for team in json_loads(blob.text)
                 if team["team"] in TopTeamNames]
        n=int(self.request.get("n"))
        bets=[]
        for i in range(n):
            j=int(random.random()*len(payoffs))
            payoff=payoffs[j]
            """
            borrow price from pre- calculated outright_payoff probability
            """
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
        
Routing=[('/tasks/curation/samples/reduce', ReduceHandler),
         ('/tasks/curation/samples/exotic_acca', ExoticAccaHandler),
         ('/tasks/curation/samples/mini_league', MiniLeagueHandler),
         ('/tasks/curation/samples/season_match_bet', SeasonMatchBetHandler),
         ('/tasks/curation/samples/single_team_outright', SingleTeamOutrightHandler),
         ('/tasks/curation/samples', IndexHandler)]

app=webapp2.WSGIApplication(Routing)
