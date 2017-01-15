from products import *

import quant.simulator as simulator

Paths, Seed = 1000, 13

"""
- max 24 teams per league
"""

def cardinal_suffix(i):
    if i in [1, 21]:
        return "st"
    elif i in [2, 22]:
        return "nd"
    elif i in [3, 23]:
        return "rd"
    else:
        return "th"

def filter_fixtures(fixtures, teams, expirydate, startdate=Today):
    teamnames=[team["name"]
               for team in teams]
    def filterfn(fixtures):
        matchteamnames=fixtures["name"].split(" vs ")
        return ((matchteamnames[0] in teamnames or
                 matchteamnames[1] in teamnames) and
                fixture["date"] > startdate and
                fixture["date"] <= expirydate)
    return [fixture for fixture in fixtures
            if filterfn(fixture)]
    
def parse_payoff_index(payoff):
    if payoff=="Winner":
        return [0]
    elif re.search("Top \\d+", payoff):
        n=int(re.findall("\\d+", payoff)[0])
        return [i for i in range(n)]
    elif re.search("\\d+((st)|(nd)|(rd)|(th)) Place", payoff):
        n=int(re.findall("\\d+", payoff)[0])
        return [n-1]
    elif re.search("Bottom \\d+", payoff):
        n=int(re.findall("\\d+", payoff)[0])
        return [-(1+i) for i in range(n)]
    elif payoff=="Bottom":
        return [-1]
    else:
        raise RuntimeError("Payoff not recognised")

def calc_positional_probability(contract, payoffs, paths=Paths, seed=Seed):
    import logging
    if contract["fixtures"]==[]:
        raise RuntimeError("No fixtures found")
    pp=simulator.simulate(contract["teams"],
                          contract["results"],
                          contract["fixtures"],
                          paths, seed)
    ppkey=contract["team"]["name"]
    def calc_payoff_value(payoffname):
        index=parse_payoff_index(payoffname)
        if len(index) > len(pp[ppkey]): 
            raise RuntimeError("Payoff is invalid")
        return sum([pp[ppkey][i]
                    for i in index])
    return [{"name": payoff["name"],
             "value": calc_payoff_value(payoff["name"])}
            for payoff in payoffs]
    
