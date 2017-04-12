from tasks.curation.samples import *

from products.positions.season_match_bets import calc_probability, description

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
        bet={"league": team["league"],
             "team": team["team"],
             "versus": team["versus"],
             "expiry": EndOfSeason}
        bet["type"]="season_match_bet"
        bet["price"]=format_price(calc_probability(bet))
        bet["description"]=description(bet)
        keyname="products/samples/season_match_bet/%i" % i
        memcache.set(keyname, json_dumps(bet), MemcacheAge)
        logging.info("Saved season_match_bet/%i" % i)
        
Routing=[('/tasks/curation/samples/season_match_bets', IndexHandler)]

app=webapp2.WSGIApplication(Routing)
