from products.positions import *

MinFilterProb, MaxFilterProb = 0.01, 0.99

"""
NB mini_league pricing starts from today / all teams start on zero points
"""

def calc_probability(bet, paths=Paths, seed=Seed):
    teams, fixtures, results = [], [], []
    for team in [{"league": bet["league"],
                  "team": bet["team"]}]+bet["versus"]:
        teams.append({"name": team["team"],
                      "points": 0,
                      "goal_diff": 0})
        fixtures+=[fixture for fixture in fetch_fixtures(team["league"])
                   if (fixture["date"] > Today and
                       fixture["date"] <= bet["expiry"] and
                       team["team"] in fixture["name"])]
    if fixtures==[]:
        raise RuntimeError("No fixtures found")
    pp=yc_simulator.simulate(teams, results, fixtures, paths, seed)
    payoff=parse_payoff(bet["payoff"], len(teams))
    return sumproduct(payoff, pp[bet["team"]])

def description(bet):
    marketstr="To be %s of mini league with %s at %s"
    return {"selection": bet["team"],
            "market": marketstr % (bet["payoff"].lower(),
                                   ", ".join([item["team"]
                                              for item in bet["versus"]]),
                                   bet["expiry"]),
            "group": {"label": "Mini-League",
                      "level": "teal"}}
    


