from models.bets import *

from quant.dixon_coles import CSGrid

Win, Lose, Draw = "win", "lose", "draw"

GT, LT, EQ = ">", "<", "="

def simulate_matches(fixtures, paths, seed):
    items=[{} for i in range(paths)]
    for fixture in fixtures:
        grid=CSGrid(*tuple(fixture.dc_poisson_means))
        for i, score in enumerate(grid.simulate(paths, seed)):
            items[i][fixture.name]=score
    return items

def simulate_match_teams(fixtures, paths, seed):
    items=[{} for i in range(paths)]
    for fixture in fixtures:
        grid=CSGrid(*tuple(fixture.dc_poisson_means))
        for i, score in enumerate(grid.simulate(paths, seed)):
            teamnames=fixture.name.split(" vs ")
            items[i][teamnames[0]]=(score[0], score[1])
            items[i][teamnames[1]]=(score[1], score[0])
    return items

