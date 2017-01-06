from controllers.api.pricing import *

import quant.simulator as simulator

Paths, Seed = 1000, 13

Winner, Top, Bottom = "Winner", "Top", "Bottom"

def parse_payoff_index(payoff):
    if payoff==Winner:
        return [0]
    elif re.search(Top+" \\d+", payoff):
        n=int(re.findall("\\d+", payoff)[0])
        return [i for i in range(n)]
    elif re.search(Bottom+" \\d+", payoff):
        n=int(re.findall("\\d+", payoff)[0])
        return [-(1+i) for i in range(n)]
    elif payoff==Bottom:
        return [-1]
    else:
        raise RuntimeError("Payoff not recognised")

