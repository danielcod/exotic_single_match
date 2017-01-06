from controllers.api.pricing import *

import quant.simulator as simulator

Paths, Seed = 1000, 13

Winner, Top, Bottom, Finish = "Winner", "Top", "Bottom", "Finish"

def parse_payoff_index(payoff):
    if payoff==Winner:
        return [0]
    elif re.search(Top+" \\d+", payoff):
        n=int(re.findall("\\d+", payoff)[0])
        return [i for i in range(n)]
    elif re.search(Finish+" \\d+((st)|(nd)|(rd)|(th))", payoff):
        n=int(re.findall("\\d+", payoff)[0])
        return [n-1]
    elif re.search(Bottom+" \\d+", payoff):
        n=int(re.findall("\\d+", payoff)[0])
        return [-(1+i) for i in range(n)]
    elif payoff==Bottom:
        return [-1]
    else:
        raise RuntimeError("Payoff not recognised")

def calc_probability(env, payoff, teamname,
                     paths=Paths, seed=Seed):
    if env["fixtures"]==[]:
        raise RuntimeError("No fixtures found")
    pp=simulator.simulate(env["teams"], env["results"], env["fixtures"],
                          paths, seed)
    index=parse_payoff_index(payoff)
    """
    this condition is okay because
    - payoffs are always anchored at 0 or -1
    - payoffs are always incrememted atomically (no breaks)
    """
    if len(index) > len(pp[teamname]): 
        raise RuntimeError("Payoff is invalid")
    return sum([pp[teamname][i]
                for i in index])
