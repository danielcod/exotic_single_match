from products import *

from quant.dixon_coles import CSGrid

Win, Lose, Draw = "win", "lose", "draw"

GT, LT, EQ = ">", "<", "="

Conditions={
    GT: "more than",
    LT: "less than",
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
    return fn

@validate_quant
def simulate_matches(fixtures, paths, seed):
    items=[{} for i in range(paths)]
    for fixture in fixtures:
        grid=CSGrid(*tuple(fixture.dc_poisson_means))
        for i, score in enumerate(grid.simulate(paths, seed)):
            items[i][fixture.name]=score
    return items

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

