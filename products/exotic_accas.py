from products import *

def match_filterfn(params):
    errmsg="'%s' is invalid goals condition for match '%s' status"
    def filterfn(score):
        if params["result"]==Win:
            return score[0] > score[1]
        elif params["result"]==Lose:
            return score[0] < score[1]
        elif params["result"]==Draw:
            return score[0]==score[1]
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
        elif params["teams_condition"]==GTE:
            return bool_to_int(n >= params["n_teams"])
        elif params["teams_condition"]==LT:
            return bool_to_int(n < params["n_teams"])
        elif params["teams_condition"]==LTE:
            return bool_to_int(n <= params["n_teams"])
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
    marketstr="%s %i %s (%s) to %s"
    return {"selection": None,
            "market": marketstr % (Conditions[params["teams_condition"]].capitalize(),
                                   params["n_teams"],
                                   "team" if params["n_teams"]==1 else "teams",
                                   ", ".join([item["team"]
                                              for item in params["teams"]]),
                                   params["result"]),
            "group": {"label": "Exotic Acca",
                      "level": "sky"}}

def description_draw(params):
    marketstr="%s %i %s (%s) to %s"
    return {"selection": None,
            "market": marketstr % (Conditions[params["teams_condition"]].capitalize(),
                                   params["n_teams"],
                                   "team" if params["n_teams"]==1 else "teams",
                                       ", ".join([item["team"]
                                                  for item in params["teams"]]),
                                   params["result"]),
            "group": {"label": "Exotic Acca",
                      "level": "sky"}}

def description(params):
    return description_draw(params) if params["result"]=="draw" else description_win_lose(params)

