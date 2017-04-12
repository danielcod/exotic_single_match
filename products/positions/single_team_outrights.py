from products.positions import *

MinFilterProb, MaxFilterProb = 0.01, 0.99

def init_payoffs(leaguename):
    teams=fetch_teams(leaguename)
    names=[]
    names.append("Winner")
    for i in range(2, 1+len(teams)/2):
        names.append("Top %i" % i)
    for i in range(2, 1+len(teams)/2):
        names.append("Outside Top %i" % i)
    names.append("Bottom")
    for i in range(2, 1+len(teams)/2):
        names.append("Bottom %i" % i)
    for i in range(2, 1+len(teams)/2):
        names.append("Outside Bottom %i" % i)
    for i in range(2, len(teams)):
        names.append("%i%s Place" % (i, cardinal_suffix(i)))
    return [{"name": name}
            for name in names]

def filter_atm_payoffs(leaguename,
                       paths=Paths, seed=Seed,
                       minprob=MinFilterProb, maxprob=MaxFilterProb):
    teams=fetch_teams(leaguename)
    results=fetch_results(leaguename)
    fixtures=[fixture for fixture in fetch_fixtures(leaguename)
              if fixture["date"] > Today] # NB no expiry check
    if fixtures==[]:
        raise RuntimeError("No fixtures found")
    pp=yc_simulator.simulate(teams, results, fixtures, paths, seed)
    payoffs=init_payoffs(leaguename)
    for payoff in payoffs:
        payoff["payoff"]=parse_payoff(payoff["name"], len(teams))
    items=[]
    for team in teams:
        for payoff in payoffs:
            prob=sumproduct(payoff["payoff"], pp[team["name"]])
            if minprob < prob < maxprob:
                item={"league": leaguename,
                      "team": team["name"],
                      "payoff": payoff["name"],
                      "probability": prob}
                items.append(item)
    return items
    
def calc_probability(bet, paths=Paths, seed=Seed):
    teams=fetch_teams(bet["league"])
    results=fetch_results(bet["league"])
    fixtures=[fixture for fixture in fetch_fixtures(bet["league"])
              if (fixture["date"] > Today and
                  fixture["date"] <= bet["expiry"])]
    if fixtures==[]:
        raise RuntimeError("No fixtures found")
    pp=yc_simulator.simulate(teams, results, fixtures, paths, seed)
    payoff=parse_payoff(bet["payoff"], len(teams))
    return sumproduct(payoff, pp[bet["team"]])

def description(bet):
    def format_payoff(payoff):
        if payoff=="Winner":
            return "top of the table"
        elif payoff=="Bottom":
            return "bottom of the table"
        elif re.search("^Top", payoff):
            return "in the %s" % payoff.lower()
        elif re.search("^Bottom", payoff):
            return "in the %s" % payoff.lower()
        elif re.search("^Outside", payoff):
            return "outside the %s" % " ".join(payoff.lower().split(" ")[1:])
        elif re.search("Place$", payoff):
            return "in "+payoff.lower()
        else:
            return payoff
    return {"selection": bet["team"], 
            "market": "%s at %s" % (format_payoff(bet["payoff"]).capitalize(),
                                    bet["expiry"]),
            "group": {"label": "Outright",
                      "level": "red"}}
    


