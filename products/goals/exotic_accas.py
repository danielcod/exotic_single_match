from products.goals import *

def match_filterfn(bet):
    errmsg="'%s' is invalid goals condition for match '%s' status"
    def filterfn(score):
        if bet["result"]==Win:
            if bet["goals_condition"]==GT:                
                return score[0]-score[1] > bet["n_goals"]
            elif bet["goals_condition"]==LT:
                return score[0]-score[1] < bet["n_goals"]
            elif bet["goals_condition"]==EQ:
                return (score[0]-score[1])==bet["n_goals"]
            else:
                raise RuntimeError(errmsg % (bet["goals_condition"], Win))
        elif bet["result"]==Lose:
            if bet["goals_condition"]==GT:
                return score[1]-score[0] > bet["n_goals"]
            elif bet["goals_condition"]==LT:
                return score[1]-score[0] < bet["n_goals"]
            elif bet["goals_condition"]==EQ:
                return (score[1]-score[0])==bet["n_goals"]                    
            else:
                raise RuntimeError(errmsg % (bet["goals_condition"], Lose))
        elif bet["result"]==Draw:
            if bet["goals_condition"]==EQ:
                return score[0]==score[1]==bet["n_goals"]
            else:
                raise RuntimeError(errmsg % (bet["goals_condition"], Draw))
        else:
            raise RuntimeError("Bet result not found/recognised")
    return filterfn

def bet_filterfn(bet):
    matchfilterfn=match_filterfn(bet)
    def bool_to_int(value):
        return 1 if value else 0
    def filterfn(scores):
        outcomes=[matchfilterfn(scores[team["team"]])
                  for team in bet["teams"]]
        n=len([outcome for outcome in outcomes
               if outcome])
        if bet["teams_condition"]==GT:
            return bool_to_int(n > bet["n_teams"])
        elif bet["teams_condition"]==LT:
            return bool_to_int(n < bet["n_teams"])
        elif bet["teams_condition"]==EQ:
            return bool_to_int(n==bet["n_teams"])
        else:
            raise RuntimeError("%s is invalid teams condition" % bet["teams_condition"])
    return filterfn

def calc_probability(bet, paths=Paths, seed=Seed):
    matches=[Fixture.get_by_key_name("%s/%s" % (team["league"],
                                                team["match"]))
             for team in bet["teams"]]
    samples=simulate_match_teams(matches, paths, seed)
    filterfn=bet_filterfn(bet)
    return sum([filterfn(scores)
                for scores in samples])/float(paths)
    
def description(bet):
    return {"selection": "[selection]",
            "market": "[market]",
            "group": {"label": "Exotic Acca",
                      "level": "blue"}}

def description_win_lose(bet):
    marketstr="%s %i %s (%s) to %s by %s %i %s"
    return {"selection": None,
            "market": marketstr % (Conditions[bet["teams_condition"]].capitalize(),
                                   bet["n_teams"],
                                   "team" if bet["n_teams"]==1 else "teams",
                                   ", ".join([item["team"]
                                              for item in bet["teams"]]),
                                   bet["result"],
                                   Conditions[bet["goals_condition"]],
                                       bet["n_goals"],
                                   "goal" if bet["n_goals"]==1 else "goals"),
            "group": {"label": "Exotic Acca",
                      "level": "sky"}}

def description_draw(bet):
    marketstr="%s %i %s (%s) to %s with exactly %i %s"
    return {"selection": None,
            "market": marketstr % (Conditions[bet["teams_condition"]].capitalize(),
                                bet["n_teams"],
                                   "team" if bet["n_teams"]==1 else "teams",
                                       ", ".join([item["team"]
                                                  for item in bet["teams"]]),
                                   bet["result"],
                                   bet["n_goals"],
                                   "goal" if bet["n_goals"]==1 else "goals"),
            "group": {"label": "Exotic Acca",
                      "level": "sky"}}

def description(bet):
    return description_draw(bet) if bet["result"]=="draw" else description_win_lose(bet)

