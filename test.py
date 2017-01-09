import urllib, yaml

from helpers.json_helpers import *

Endpoint="http://localhost:8080"

Items=yaml.load("""
# << general >>
- path: "/api/leagues"
- path: "/api/expiries"
- path: "/api/teams?league=ENG.1"
# << single teams >>
- path: "/api/pricing/single_teams/price"
  data: 
    product: single_teams
    query:
      league: ENG.1
      team: Chelsea
      payoff: Winner
      expiry: "2017-03-01"
# << mini leagues >>
- path: "/api/pricing/mini_leagues/price"
  data:
    product: mini_leagues
    query: 
      teams:
      - league: ENG.1
        name: "Arsenal"
        selected: true
      - league: SPA.1
        name: "Celta Vigo"
      - league: GER.1
        name: "Borussia Dortmund"
      payoff: Winner
      expiry: "2017-03-01"
""")

if __name__=="__main__":
    try:
        for item in Items:
            print "---------------"
            print item
            print
            url=Endpoint+item["path"]
            if "data" not in item:
                print urllib.urlopen(url).read()
            else:
                payload=json_dumps(item["data"])
                print urllib.urlopen(url, payload).read()
    except RuntimeError, error:
        print "Error: %s" % str(error)
