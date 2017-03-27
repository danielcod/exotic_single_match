from models.bets import *

import quant.simulator as simulator

MinFilterProb, MaxFilterProb = 0.01, 0.99

Paths, Seed = 1000, 13

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

def sumproduct(X, Y):
    return sum([x*y for x, y in zip(X, Y)])

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

def parse_payoff(payoff, n):
    def parse_i(payoff):
        return int(re.findall("\\d+", payoff)[0])
    if re.search("^Winner$", payoff):
        return kwik_payoff("1|%ix0" % (n-1))
    elif re.search("^Top \\d+$", payoff):
        i=parse_i(payoff)
        return kwik_payoff("%ix1|%ix0" % (i, n-i))
    elif re.search("^Outside Top \\d+$", payoff):
        i=parse_i(payoff)
        return kwik_payoff("%ix0|%ix1" % (i, n-i))
    elif re.search("^\\d+((st)|(nd)|(rd)|(th)) Place$", payoff):
        i=parse_i(payoff)
        return kwik_payoff("%ix0|1|%ix0" % (i-1, n-i))
    elif re.search("^Bottom \\d+$", payoff):
        i=parse_i(payoff)
        return kwik_payoff("%ix0|%ix1" % (n-i, i))
    elif re.search("^Outside Bottom \\d+$", payoff):
        i=parse_i(payoff)
        return kwik_payoff("%ix1|%ix0" % (n-i, i))
    elif re.search("^Bottom$", payoff):
        return kwik_payoff("%ix0|1" % (n-1))
    else:
        raise RuntimeError("'%s' not recognised as payoff" % payoff)

def cardinal_suffix(i):
    if (1==(i % 10) and i!=11):
        return "st"
    elif (2==(i % 10) and i!=12):
        return "nd"
    elif (3==(i % 10) and i!=13):
        return "rd"
    else:
        return "th"

    
