"""
- script to initialise sample exotic_acca
"""

import random, urllib, yaml

from helpers.json_helpers import *

FixturesEndpoint="http://localhost:8080/api/multi_match/legs"

Types=yaml.load("""
- winners
- losers
- draws
- overs
- unders
""")

def fetch_fixtures():
    return json_loads(urllib.urlopen(FixturesEndpoint).read())

def initialise(nlegs, ngoals):
    fixtures=fetch_fixtures()
    def random_fixture():
        return fixtures[int(random.random()*len(fixtures))]
    def random_selection(fixture):
        teamnames=fixture["name"].split(" vs ")
        return teamnames[int(random.random()*2)]
    return {"type": Types[int(random.random()*len(Types))],
            "size": 2,
            "price": 1.01,
            "n_legs": nlegs/2,
            "n_goals": ngoals,
            "legs": [{"league": fixture["league"],
                      "match": fixture["name"],
                      "selection": random_selection(fixture)}
                     for fixture in [random_fixture()
                                     for i in range(nlegs)]]}
    
if __name__=="__main__":
    try:
        import sys, re
        if len(sys.argv) < 3:
            raise RuntimeError("Please enter n_legs, n_goals")
        nlegs, ngoals = sys.argv[1:3]
        if not re.search("^\\d+$", nlegs):
            raise RuntimeError("n_legs is invalid")
        nlegs=int(nlegs)
        if not re.search("^\\d+$", ngoals):
            raise RuntimeError("n_goals is invalid")
        ngoals=int(ngoals)
        acca=initialise(nlegs, ngoals)
        dest=file("tmp/multi_match_bet.json", 'w')
        dest.write(json_dumps(acca))
        dest.close()
    except RuntimeError, error:
        print "Error: %s" % str(error)
