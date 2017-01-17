from models.products import *

import quant.simulator as simulator

Promotion=yaml.load("""
ENG.2: '2x1|4x0.25|18x0'
ENG.3: '2x1|4x0.25|18x0'
ENG.4: '3x1|4x0.25|17x0'
""")

Relegation=yaml.load("""
ENG.1: '17x0|3x1'
ENG.2: '21x0|3x1'
ENG.3: '20x0|4x1'
ENG.4: '22x0|2x1'
GER.1: '15x0|0.33|2x1'
FRA.1: '17x0|3x1'
SPA.1: '17x0|3x1'
""")                  

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

def kwik_payoff(text):
    payoff=[]
    for item in text.split("|"):
        tokens=[float(tok)
                for tok in item.split("x")]
        if tokens==[]:
            pass
        elif len(tokens)==1:
            payoff.append(tokens[0])
        else:
            payoff+=[tokens[1]
                     for i in range(int(tokens[0]))]
    return payoff

def parse_payoff(payoff, n, leaguename):
    def parse_i(payoff):
        return int(re.findall("\\d+", payoff)[0])
    if re.search("^Winner$", payoff):
        return kwik_payoff("1|%ix0" % (n-1))
    elif re.search("^Promotion$", payoff):
        if leaguename not in Promotion:
            raise RuntimeError("No Promotion for %s" % leaguename)
        return kwik_payoff(Promotion[leaguename])
    elif re.search("^Top \\d+$", payoff):
        i=parse_i(payoff)
        return kwik_payoff("%ix1|%ix0" % (i, n-i))
    elif re.search("^Outside Top \\d+$", payoff):
        i=parse_i(payoff)
        return kwik_payoff("%ix0|%ix1" % (i, n-i))
    elif re.search("^\\d+((st)|(nd)|(rd)|(th)) Place$", payoff):
        i=parse_i(payoff)
        return kwik_payoff("%ix0|%1x1|%ix0" % (i-1, 1, n-i))
    elif re.search("^Bottom \\d+$", payoff):
        i=parse_i(payoff)
        return kwik_payoff("%ix0|%ix1" % (n-i, i))
    elif re.search("^Outside Bottom \\d+$", payoff):
        i=parse_i(payoff)
        return kwik_payoff("%ix1|%ix0" % (n-i, i))
    elif re.search("^Relegation$", payoff):
        if leaguename not in Relegation:
            raise RuntimeError("No Relegation for %s" % leaguename)
        return kwik_payoff(Relegation[leaguename])
    elif re.search("^Bottom$", payoff):
        return kwik_payoff("%ix0|1" % (n-1))
    else:
        raise RuntimeError("'%s' not recognised as payoff" % payoff)

def sumproduct(X, Y):
    return sum([x*y for x, y in zip(X, Y)])
    
def calc_positional_probability(struct, paths=Paths, seed=Seed):
    if struct["fixtures"]==[]:
        raise RuntimeError("No fixtures found")
    pp=simulator.simulate(struct["teams"],
                          struct["results"],
                          struct["fixtures"],
                          paths, seed)
    leaguename=struct["team"]["league"]
    teamname=struct["team"]["name"]
    def calc_payoff_value(payoffname):
        payoff=parse_payoff(payoffname,
                            len(struct["teams"]),
                            leaguename)
        return sumproduct(payoff, pp[teamname])
    return [{"name": payoff["name"],
             "value": calc_payoff_value(payoff["name"])}
            for payoff in struct["payoffs"]]
    
