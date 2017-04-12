from products.positions import *

MinFilterProb, MaxFilterProb = 0.01, 0.99

Payoff="Winner"

"""
- this is a quick heuristic calculation 
- not 100% correct as assumes the two distibutions are independant
- also make some funny implicit assumptions about two teams being in the same place
- but should be close
"""
    
def filter_atm_versus(bet, leaguename,
                      paths=Paths, seed=Seed,
                      minprob=MinFilterProb, maxprob=MaxFilterProb):
    teams=fetch_teams(leaguename)
    results=fetch_results(leaguename)
    fixtures=[fixture for fixture in fetch_fixtures(leaguename)
              if fixture["date"] > Today] # NB no expiry check
    if fixtures==[]:
        raise RuntimeError("No fixtures found")
    pp=yc_simulator.simulate(teams, results, fixtures, paths, seed)
    def calc_probability(teamname, versusname):
        return sum([pp[teamname][i]*sum(pp[versusname][i:])
                    for i in range(len(pp))])
    items=[]
    for team in teams:
        for versus in teams:
            if team["name"]==versus["name"]:
                continue
            prob0, prob1 = (calc_probability(team["name"],
                                             versus["name"]),
                            calc_probability(versus["name"],
                                             team["name"]))
            prob=prob0/float(prob0+prob1)
            if ((minprob < prob < maxprob) and
                (minprob < prob < maxprob)):
                item={"league": leaguename,
                      "team": team["name"],
                      "versus": versus["name"],
                      "probability": prob}
                items.append(item)
    return items

def calc_probability(bet, paths=Paths, seed=Seed):
    teams=[team for team in fetch_teams(bet["league"])
           if team["name"] in [bet["team"], bet["versus"]]]
    results=[result for result in fetch_results(bet["league"])
             if (bet["team"] in result["name"] or
                 bet["versus"] in result["name"])]
    fixtures=[fixture for fixture in fetch_fixtures(bet["league"])
              if ((fixture["date"] > Today) and
                  (fixture["date"] <= bet["expiry"]) and
                  ((bet["team"] in fixture["name"]) or
                   (bet["versus"] in fixture["name"])))]
    if fixtures==[]:
        raise RuntimeError("No fixtures found")
    pp=yc_simulator.simulate(teams, results, fixtures, paths, seed)
    payoff=parse_payoff(Payoff, len(teams))
    return sumproduct(payoff, pp[bet["team"]])

def description(bet):
    return {"selection": bet["team"], 
            "market": "To be above %s at %s" % (bet["versus"],
                                                bet["expiry"]),
            "group": {"label": "SMB",
                      "level": "orange"}}
    




