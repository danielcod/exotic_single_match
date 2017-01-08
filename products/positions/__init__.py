from products import *

import quant.simulator as simulator

Paths, Seed = 1000, 13

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

def calc_positional_probability(contract, paths=Paths, seed=Seed):
    if contract["fixtures"]==[]:
        raise RuntimeError("No fixtures found")
    pp=simulator.simulate(contract["teams"],
                          contract["results"],
                          contract["fixtures"],
                          paths, seed)
    ppkey=contract["team"]["name"]
    if len(contract["index"]) > len(pp[ppkey]): 
        raise RuntimeError("Payoff is invalid")
    return sum([pp[ppkey][i]
                for i in contract["index"]])
