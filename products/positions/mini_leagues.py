from products.positions import *

MinFilterProb, MaxFilterProb = 0.01, 0.99

"""
NB mini_league pricing starts from today / all teams start on zero points
"""

def calc_probability(params, paths=Paths, seed=Seed):
    teams, fixtures, results = [], [], []
    for team in [{"league": params["league"],
                  "team": params["team"]}]+params["versus"]:
        teams.append({"name": team["team"],
                      "points": 0,
                      "goal_diff": 0})
        fixtures+=[fixture for fixture in fetch_fixtures(team["league"])
                   if (fixture["date"] > Today and
                       fixture["date"] <= params["expiry"] and
                       team["team"] in fixture["name"])]
    if fixtures==[]:
        raise RuntimeError("No fixtures found")
    pp=yc_simulator.simulate(teams, results, fixtures, paths, seed)
    payoff=parse_payoff(params["payoff"], len(teams))
    return sumproduct(payoff, pp[params["team"]])

def description(params):
    marketstr="To be %s of mini league with %s at %s"
    return {"selection": params["team"],
            "market": marketstr % (params["payoff"].lower(),
                                   ", ".join([item["team"]
                                              for item in params["versus"]]),
                                   params["expiry"]),
            "group": {"label": "Mini-League",
                      "level": "teal"}}
    


