from quant.dixon_coles import CSGrid

import yaml

Win, Lose, Draw = "win", "lose", "draw"

GT, LT, EQ = ">", "<", "="

Fixtures=yaml.load("""
- name: A vs B
  dc_poisson_means:
  - 1.5
  - 0.5
- name: C vs D
  dc_poisson_means:
  - 0.75
  - 0.75
- name: E vs F
  dc_poisson_means:
  - 0.75
  - 1.5 
""")

Bet=yaml.load("""
teams:
- A
- D
- E
n_teams: 2
teams_condition: ">"
result: win
n_goals: 2
goals_condition: ">"
""")

def simulate(fixtures, paths, seed):
    items=[{} for i in range(paths)]
    for fixture in fixtures:
        grid=CSGrid(*tuple(fixture["dc_poisson_means"]))
        for i, score in enumerate(grid.simulate(paths, seed)):
            teamnames=fixture["name"].split(" vs ")
            items[i][teamnames[0]]=(score[0], score[1])
            items[i][teamnames[1]]=(score[1], score[0])
    return items

def init_match_filterfn(bet):
    result, condition, limit = bet["result"], bet["goals_condition"], bet["n_goals"]
    errmsg="'%s' not recognised as goals condition for match '%s' status"
    def filterfn(score):
        if result==Win:
            if condition==GT:                
                return score[0]-score[1] > limit
            elif condition==LT:
                return score[0]-score[1] < limit
            else:
                raise RuntimeError(errmsg % (condition, Win))
        elif result==Lose:
            if condition==GT:
                return score[1]-score[0] > limit
            elif condition==LT:
                return score[1]-score[0] < limit
            else:
                raise RuntimeError(errmsg % (condition, Lose))
        elif result==Draw:
            if condition==EQ:
                return score[0]==score[1]==limit
            else:
                raise RuntimeError(errmsg % (condition, Draw))
        else:
            raise RuntimeError("Bet result not found/recognised")
    return filterfn

def init_bet_filterfn(bet):
    condition, limit = bet["teams_condition"], bet["n_teams"]
    matchfilterfn=init_match_filterfn(bet)
    def filterfn(scores):
        outcomes=[matchfilterfn(scores[teamname])
                  for teamname in bet["teams"]]
        n=len([outcome for outcome in outcomes
               if outcome])
        if condition==GT:
            return 1 if n > limit else 0
        elif condition==LT:
            return 1 if n < limit else 0
        elif condition==EQ:
            return 1 if n==limit else 0
        else:
            raise RuntimeError("%s not recognised as team condition" % condition)
    return filterfn

if __name__=="__main__":
    paths, seed = 3, 13
    samples=simulate(Fixtures, paths, seed)
    filterfn=init_bet_filterfn(Bet)
    print sum([filterfn(scores)
               for scores in samples])/float(paths)
