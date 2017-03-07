"""
- need to replace existing Oddschecker code with new SDC stuff
- solve with respect to 1x2 only; can use rho for over/under matching later
"""

"""
http://localhost:8888/notebooks/notebooks/sportshacker/dixon_coles_adjustment.ipynb
"""

import math

HomeWin, AwayWin, Draw = "home_win", "away_win", "draw"

def poisson(l, x):
    return (l**x)*math.exp(-l)/math.factorial(x)

"""
def correct_score_grid(lx, ly, rho, n):
    def DC_factor(i, j):
        if i==0 and j==0:
            return 1-lx*ly*rho
        elif i==0 and j==1:
            return 1+lx*rho
        elif i==1 and j==0:
            return 1+ly*rho
        elif i==1 and j==1:
            return 1-rho
        else:
            return 1
    return [[poisson(lx, i)*poisson(ly, j)*DC_factor(i, j)
             for j in range(n)]
            for i in range(n)]
"""

def correct_score_grid(lx, ly, n):
    return [[poisson(lx, i)*poisson(ly, j)
             for j in range(n)]
            for i in range(n)]

class CSGrid(list):

    def __init__(self, data):
        list.__init__(self, data)

    def sum(self, filterfn):
        return sum([self[i][j]                    
                    for i in range(len(self))
                    for j in range(len(self))
                    if filterfn(i, j)])
                    
    def match_odds(self, selection):
        filterfns={
            HomeWin: lambda i, j: i > j,
            Draw: lambda i, j: i==j,
            AwayWin: lambda i, j: i < j
        }
        return self.sum(filterfns[selection])
    
def solve_grid_params(match_odds_probs, n):
    from scipy import optimize
    def errfn(q):
        lx, ly = q
        grid=CSGrid(correct_score_grid(lx, ly, n))
        return sum([(grid.match_odds(key)-value)**2
                    for key, value in match_odds_probs.items()])
    return optimize.fmin(errfn, (1, 1))

if __name__=="__main__":
    n=10
    lx, ly = solve_grid_params({
        HomeWin: 0.5,
        Draw: 0.3,
        AwayWin: 0.2
    }, n)
    print "lx: %.5f" % lx
    print "ly: %.5f" % ly
    grid=CSGrid(correct_score_grid(lx, ly, n))
    for selection in [HomeWin,
                      Draw,
                      AwayWin]:
        print "%s: %.5f" % (selection, grid.match_odds(selection))
    
