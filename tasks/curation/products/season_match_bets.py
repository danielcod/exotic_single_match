from tasks.curation.products import *

class IndexHandler(webapp2.RequestHandler):

    @validate_query({'n': '\\d+'})
    @task
    def post(self):
        blob=Blob.get_by_key_name("products/smb_versus")
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
        keyname="products/samples/season_match_bet"
        memcache.set(keyname, json_dumps(bets), MemcacheAge)
        logging.info("Saved %i season_match_bet" % len(bets))
        
Routing=[('/tasks/curation/products/season_match_bets', IndexHandler)]

app=webapp2.WSGIApplication(Routing)
