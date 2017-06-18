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

def validate_quant(fn):
    def wrapped_fn(fixtures, *args, **kwargs):
        errors=[]
        for fixture in fixtures:
            if fixture.dc_poisson_means in ['', None, []]:
                errors.append("%s/%s" % (fixture.league, fixture.name))
        if errors!=[]:
            raise RuntimeError("Following fixtures are missing poisson means: %s" % ", ".join(errors))
        return fn(fixtures, *args, **kwargs)
    return wrapped_fn

@validate_quant
def simulate_match_teams(fixtures, paths, seed):
    items=[{} for i in range(paths)]
    for fixture in fixtures:
        grid=CSGrid(*tuple(fixture.dc_poisson_means))
        for i, score in enumerate(grid.simulate(paths, seed)):
            teamnames=fixture.name.split(" vs ")
            items[i][teamnames[0]]=(score[0], score[1])
            items[i][teamnames[1]]=(score[1], score[0])
    return items

def match_filterfn(params):
    errmsg="'%s' is invalid goals condition for match '%s' status"
    def filterfn(score):
        if params["result"]==Win:
            if params["goals_condition"]==GT:                
                return score[0]-score[1] > params["n_goals"]
            elif params["goals_condition"]==GTE:                
                return score[0]-score[1] >= params["n_goals"]
            elif params["goals_condition"]==LT:
                return score[0]-score[1] < params["n_goals"]
            elif params["goals_condition"]==LTE:
                return score[0]-score[1] <= params["n_goals"]
            elif params["goals_condition"]==EQ:                
                return (score[0]-score[1])==params["n_goals"]
            else:
                raise RuntimeError(errmsg % (params["goals_condition"], Win))
        elif params["result"]==Lose:
            if params["goals_condition"]==GT:
                return score[1]-score[0] > params["n_goals"]
            elif params["goals_condition"]==GTE:
                return score[1]-score[0] >= params["n_goals"]
            elif params["goals_condition"]==LT:
                return score[1]-score[0] < params["n_goals"]
            elif params["goals_condition"]==LTE:
                return score[1]-score[0] <= params["n_goals"]
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
    
if __name__=="__main__":
    pass
