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
    
def parse_payoff_index(payoff, n):
    def parse_i(payoff):
        return int(re.findall("\\d+", payoff)[0])
    if re.search("^Winner$", payoff):
        return [0]
    elif re.search("^Top \\d+$", payoff):
        i=parse_i(payoff)
        return [j for j in range(i)]
    elif re.search("^Outside Top \\d+$", payoff):
        i=parse_i(payoff)
        return [j for j in range(n)
                if j >= i]
    elif re.search("^\\d+((st)|(nd)|(rd)|(th)) Place$", payoff):
        i=parse_i(payoff)
        return [i-1]
    elif re.search("^Bottom \\d+$", payoff):
        i=parse_i(payoff)
        return [-(1+j) for j in range(i)]
    elif re.search("^Outside Bottom \\d+$", payoff):
        i=parse_i(payoff)
        return [j for j in range(n)
                if j < n-i]
    elif re.search("^Bottom$", payoff):
        return [-1]
    else:
        raise RuntimeError("'%s' not recognised as payoff" % payoff)

def calc_positional_probability(contract, paths=Paths, seed=Seed):
    if contract["fixtures"]==[]:
        raise RuntimeError("No fixtures found")
    pp=simulator.simulate(contract["teams"],
                          contract["results"],
                          contract["fixtures"],
                          paths, seed)
    ppkey=contract["team"]["name"]
    def calc_payoff_value(payoffname):
        index=parse_payoff_index(payoffname, len(contract["teams"]))
        if len(index) > len(pp[ppkey]): 
            raise RuntimeError("Payoff is invalid")
        return sum([pp[ppkey][i]
                    for i in index])
    return [{"name": payoff["name"],
             "value": calc_payoff_value(payoff["name"])}
            for payoff in contract["payoffs"]]
    
