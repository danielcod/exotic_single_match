from products.goals import *

def match_filterfn(params):
    errmsg="'%s' is invalid goals condition for match '%s' status"
    def filterfn(score):
        if params["result"]==Win:
            if params["goals_condition"]==GT:                
                return score[0]-score[1] > params["n_goals"]
            elif params["goals_condition"]==LT:
                return score[0]-score[1] < params["n_goals"]
            elif params["goals_condition"]==EQ:
                return (score[0]-score[1])==params["n_goals"]
            else:
                raise RuntimeError(errmsg % (params["goals_condition"], Win))
        elif params["result"]==Lose:
            if params["goals_condition"]==GT:
                return score[1]-score[0] > params["n_goals"]
            elif params["goals_condition"]==LT:
                return score[1]-score[0] < params["n_goals"]
            elif params["goals_condition"]==EQ:
                return (score[1]-score[0])==params["n_goals"]                    
            else:
                raise RuntimeError(errmsg % (params["goals_condition"], Lose))
        elif params["result"]==Draw:
            if params["goals_condition"]==EQ:
                return score[0]==score[1]==params["n_goals"]
            else:
                raise RuntimeError(errmsg % (params["goals_condition"], Draw))
        else:
            raise RuntimeError("Params result not found/recognised")
    return filterfn

def params_filterfn(params):
    matchfilterfn=match_filterfn(params)
    def bool_to_int(value):
        return 1 if value else 0
    def filterfn(scores):
        outcomes=[matchfilterfn(scores[team["team"]])
                  for team in params["teams"]]
        n=len([outcome for outcome in outcomes
               if outcome])
        if params["teams_condition"]==GT:
            return bool_to_int(n > params["n_teams"])
        elif params["teams_condition"]==LT:
            return bool_to_int(n < params["n_teams"])
        elif params["teams_condition"]==EQ:
            return bool_to_int(n==params["n_teams"])
        else:
            raise RuntimeError("%s is invalid teams condition" % params["teams_condition"])
    return filterfn

def calc_probability(params, paths=Paths, seed=Seed):
    matches=[Fixture.get_by_key_name("%s/%s" % (team["league"],
                                                team["match"]))
             for team in params["teams"]]
    samples=simulate_match_teams(matches, paths, seed)
    filterfn=params_filterfn(params)
    return sum([filterfn(scores)
                for scores in samples])/float(paths)
    
def description(params):
    return {"selection": "[selection]",
            "market": "[market]",
            "group": {"label": "Exotic Acca",
                      "level": "blue"}}

def description_win_lose(params):
    marketstr="%s %i %s (%s) to %s by %s %i %s"
    return {"selection": None,
            "market": marketstr % (Conditions[params["teams_condition"]].capitalize(),
                                   params["n_teams"],
                                   "team" if params["n_teams"]==1 else "teams",
                                   ", ".join([item["team"]
                                              for item in params["teams"]]),
                                   params["result"],
                                   Conditions[params["goals_condition"]],
                                       params["n_goals"],
                                   "goal" if params["n_goals"]==1 else "goals"),
            "group": {"label": "Exotic Acca",
                      "level": "sky"}}

def description_draw(params):
    marketstr="%s %i %s (%s) to %s with exactly %i %s"
    return {"selection": None,
            "market": marketstr % (Conditions[params["teams_condition"]].capitalize(),
                                params["n_teams"],
                                   "team" if params["n_teams"]==1 else "teams",
                                       ", ".join([item["team"]
                                                  for item in params["teams"]]),
                                   params["result"],
                                   params["n_goals"],
                                   "goal" if params["n_goals"]==1 else "goals"),
            "group": {"label": "Exotic Acca",
                      "level": "sky"}}

def description(params):
    return description_draw(params) if params["result"]=="draw" else description_win_lose(params)

