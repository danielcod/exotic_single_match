# from quant.dixon_coles import CSGrid

# START TEMP CODE

from random import Random

import math

# END TEMP CODE

Win, Lose, Draw = "win", "lose", "draw"

GT, GTE, LT, LTE, EQ = ">", ">=", "<", "<=", "="

Conditions={
    GT: "more than",
    GTE: "at least",
    LT: "less than",
    LTE: "at most",
    EQ: "exactly"
}

Paths, Seed = 1000, 13

"""
- using a custom copy of CSGrid because existing version in quant/dixon_coles.py only accepts poisson means as constructor args
"""

class CSGrid(list):

    """
    def __init__(self, lx, ly, n=N):
        list.__init__(self, [[poisson(lx, i)*poisson(ly, j)
                              for j in range(n)]
                             for i in range(n)])
    """

    def __init__(self, values):
        list.__init__(self, values)

    def sum(self, filterfn):
        return sum([self[i][j]                    
                    for i in range(len(self))
                    for j in range(len(self))
                    if filterfn(i, j)])

    def match_odds(self, selection):
        if selection==HomeWin:
            filterfn=lambda i, j: i > j
        elif selection==Draw:
            filterfn=lambda i, j: i==j
        elif selection==AwayWin:
            filterfn=lambda i, j: i < j
        else:
            raise RuntimeError("No filter fn for '%s'" % selection)
        return self.sum(filterfn)
    
    def simulate(self, paths, seed):
        def flatten(grid):
            items, prob = [], 0
            for i in range(len(grid)):
                for j in range(len(grid)):
                    prob+=self[i][j]
                    item=[(i, j), prob]
                    items.append(item)
            items[-1][1]=1.0 # NB
            return items
        def simulate(items, rand):
            startprob, endprob = 0, None
            q=rand.random()
            for item in items:
                endprob=item[1]
                if (q > startprob and
                    q <= endprob):
                    return item[0]
                startprob=endprob
        rand=Random()
        rand.seed(seed)        
        items=flatten(self)    
        return [simulate(items, rand)
                for i in range(paths)]

def simulate_match_teams(fixtures, paths, seed):
    items=[{} for i in range(paths)]
    for fixture in fixtures:
        # grid=CSGrid(*tuple(fixture.dc_poisson_means))
        grid=CSGrid(fixture["dc_grid"])
        for i, score in enumerate(grid.simulate(paths, seed)):
            teamnames=fixture.name.split(" vs ")
            items[i][teamnames[0]]=(score[0], score[1])
            items[i][teamnames[1]]=(score[1], score[0])
    return items

def leg_filterfn(bet):
    errmsg="'%s' is invalid goals condition for match '%s' status"
    def filterfn(score):
        if bet["resultCondition"]==Win:
            if bet["goalsCondition"]==GT:                
                return score[0]-score[1] > bet["nGoals"]
            elif bet["goalsCondition"]==GTE:                
                return score[0]-score[1] >= bet["nGoals"]
            elif bet["goalsCondition"]==LT:
                return score[0]-score[1] < bet["nGoals"]
            elif bet["goalsCondition"]==LTE:
                return score[0]-score[1] <= bet["nGoals"]
            elif bet["goalsCondition"]==EQ:                
                return (score[0]-score[1])==bet["nGoals"]
            else:
                raise RuntimeError(errmsg % (bet["goalsCondition"], Win))
        elif bet["resultCondition"]==Lose:
            if bet["goalsCondition"]==GT:
                return score[1]-score[0] > bet["nGoals"]
            elif bet["goalsCondition"]==GTE:
                return score[1]-score[0] >= bet["nGoals"]
            elif bet["goalsCondition"]==LT:
                return score[1]-score[0] < bet["nGoals"]
            elif bet["goalsCondition"]==LTE:
                return score[1]-score[0] <= bet["nGoals"]
            elif bet["goalsCondition"]==EQ:
                return (score[1]-score[0])==bet["nGoals"]
            else:
                raise RuntimeError(errmsg % (bet["goalsCondition"], Lose))
        elif bet["resultCondition"]==Draw:
            if bet["goalsCondition"]==EQ:
                return score[0]==score[1]==bet["nGoals"]
            else:
                raise RuntimeError(errmsg % (bet["goalsCondition"], Draw))
        else:
            raise RuntimeError("Bet result not found/recognised")
    return filterfn

def bool_to_int(value):
    return 1 if value else 0

def bet_filterfn(bet):
    legfilterfn=leg_filterfn(bet)
    def filterfn(scores):
        """
        this needs to change to iterate over existing leg structure and information thereby provided
        """        
        outcomes=[legfilterfn(scores[team["team"]])
                  for team in bet["teams"]]
        n=len([outcome for outcome in outcomes
               if outcome])
        if bet["legsCondition"]==GT:
            return bool_to_int(n > bet["nLegs"])
        elif bet["legsCondition"]==GTE:
            return bool_to_int(n >= bet["nLegs"])
        elif bet["legsCondition"]==LT:
            return bool_to_int(n < bet["nLegs"])
        elif bet["legsCondition"]==LTE:
            return bool_to_int(n <= bet["nLegs"])
        elif bet["legsCondition"]==EQ:
            return bool_to_int(n==bet["nLegs"])
        else:
            raise RuntimeError("%s is invalid legs condition" % bet["legsCondition"])
    return filterfn

def calc_probability(bet, paths=Paths, seed=Seed):
    """
    this needs to change to filter matches from list of supplied matches
    """
    matches=[Fixture.get_by_key_name("%s/%s" % (team["league"],
                                                team["match"]))
             for team in bet["teams"]]
    samples=simulate_match_teams(matches, paths, seed)
    filterfn=bet_filterfn(bet)
    return sum([filterfn(sample)
                for sample in samples])/float(paths)

import datetime 

SampleBet={u'nLegs': 3, u'nGoals': 2, u'bust': 4509327226, u'legs': [{u'selection': {u'description': u'Brann (vs Sarpsborg 08)', u'price': 3.2285714934472356, u'attr': u'away'}, u'match': {u'selected': u'away', u'kickoff': datetime.datetime(2017, 6, 25, 16, 0), u'name': u'Sarpsborg 08 vs Brann', u'1x2_prices': [2.2599999427795407, 4.035714366809044, 3.2285714934472356], u'league': u'NOR.1'}}, {u'selection': {u'description': u'Odds Ballklubb (vs Aalesund)', u'price': 2.809085650912273, u'attr': u'away'}, u'match': {u'selected': u'away', u'kickoff': datetime.datetime(2017, 6, 25, 16, 0), u'name': u'Aalesund vs Odds Ballklubb', u'1x2_prices': [2.5389812514941075, 3.9975451629071794, 2.809085650912273], u'league': u'NOR.1'}}, {u'selection': {u'description': u'Rosenborg (vs Sogndal)', u'price': 1.3839999914169312, u'attr': u'home'}, u'match': {u'selected': u'home', u'kickoff': datetime.datetime(2017, 6, 25, 16, 0), u'name': u'Rosenborg vs Sogndal', u'1x2_prices': [1.3839999914169312, 6.487500104773792, 8.10937513096724], u'league': u'NOR.1'}}, {u'selection': {u'description': u'Stabaek (vs Kristiansund BK)', u'price': 1.9882478779977166, u'attr': u'home'}, u'match': {u'selected': u'home', u'kickoff': datetime.datetime(2017, 6, 25, 16, 0), u'name': u'Stabaek vs Kristiansund BK', u'1x2_prices': [1.9882478779977166, 4.191441521012668, 3.8690227453691866], u'league': u'NOR.1'}}]}

if __name__=="__main__":
    from helpers.json_helpers import json_loads
    matches=json_loads(file("dev/matches.json").read())
    import copy
    bet=copy.deepcopy(SampleBet)
    bet["resultCondition"]=Win
    bet["legsCondition"]=GTE
    bet["goalsCondition"]=GTE
    print bet
    
    

