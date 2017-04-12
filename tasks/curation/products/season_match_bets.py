from tasks.curation.products import *

class IndexHandler(webapp2.RequestHandler):

    @validate_query({'i': '\\d+'})
    @task
    def post(self):
        i=int(self.request.get("i"))
        blob=Blob.get_by_key_name("products/smb_versus")
        teams=[team for team in json_loads(blob.text)
               if team["team"] in TopTeamNames]
        j=int(random.random()*len(teams))
        team=teams[j]
        price=format_price(team["probability"])
        bet=SeasonMatchBet(league=team["league"],
                           team=team["team"],
                           versus=team["versus"],
                           expiry=EndOfSeason,
                           price=price)
        keyname="products/samples/season_match_bet/%i" % i
        memcache.set(keyname, json_dumps(bet.to_json()), MemcacheAge)
        logging.info("Saved season_match_bet/%i" % i)
        
Routing=[('/tasks/curation/products/season_match_bets', IndexHandler)]

app=webapp2.WSGIApplication(Routing)
