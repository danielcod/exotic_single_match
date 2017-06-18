from quant.dixon_coles import CSGrid

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

def simulate_match_teams(fixtures, paths, seed):
    items=[{} for i in range(paths)]
    for fixture in fixtures:
        grid=CSGrid(fixture["dc_grid"])
        for i, score in enumerate(grid.simulate(paths, seed)):
            teamnames=fixture["name"].split(" vs ")
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
        outcomes=[legfilterfn(scores[leg["selection"]["team"]])
                  for leg in bet["legs"]]
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

def calc_probability(bet, allmatches, paths=Paths, seed=Seed):
    allmatches=dict([(match["name"], match)
                     for match in allmatches])
    matches=[]
    for leg in bet["legs"]:
        if leg["match"]["name"] not in allmatches:
            raise RuntimeError("%s not found" % leg["match"]["name"])
        matches.append(allmatches[leg["match"]["name"]])
    samples=simulate_match_teams(matches, paths, seed)
    filterfn=bet_filterfn(bet)
    return sum([filterfn(sample)
                for sample in samples])/float(paths)

import datetime 

SampleBet={u'legs': [{u'price': 3.2285714934472356, u'match': {u'1x2_prices': [2.2599999427795407, 4.035714366809044, 3.2285714934472356], u'league': u'NOR.1', u'selected': u'away', u'name': u'Sarpsborg 08 vs Brann', u'kickoff': datetime.datetime(2017, 6, 25, 16, 0)}, u'description': u'Brann (vs Sarpsborg 08)', u'selection': {u'team': u'Brann', u'homeAway': u'away'}}, {u'price': 2.809085650912273, u'match': {u'1x2_prices': [2.5389812514941075, 3.9975451629071794, 2.809085650912273], u'league': u'NOR.1', u'selected': u'away', u'name': u'Aalesund vs Odds Ballklubb', u'kickoff': datetime.datetime(2017, 6, 25, 16, 0)}, u'description': u'Odds Ballklubb (vs Aalesund)', u'selection': {u'team': u'Odds Ballklubb', u'homeAway': u'away'}}, {u'price': 8.10937513096724, u'match': {u'1x2_prices': [1.3839999914169312, 6.487500104773792, 8.10937513096724], u'league': u'NOR.1', u'selected': u'away', u'name': u'Rosenborg vs Sogndal', u'kickoff': datetime.datetime(2017, 6, 25, 16, 0)}, u'description': u'Sogndal (vs Rosenborg)', u'selection': {u'team': u'Sogndal', u'homeAway': u'away'}}], u'bust': 4664634616, u'nLegs': 2, u'nGoals': 2}

if __name__=="__main__":
    from helpers.json_helpers import json_loads
    allmatches=json_loads(file("quant/fixtures/matches.json").read())
    import copy
    bet=copy.deepcopy(SampleBet)
    bet["resultCondition"]=Win
    bet["legsCondition"]=GTE
    bet["goalsCondition"]=GTE
    print calc_probability(bet, allmatches)
    
    

