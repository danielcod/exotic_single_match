"""
http://localhost:8888/notebooks/notebooks/sportshacker/dixon_coles_adjustment.ipynb
"""

import math

HomeWin, Draw, AwayWin = MOSelections = ["home_win", "draw", "away_win"]

def poisson(l, x):
    return (l**x)*math.exp(-l)/math.factorial(x)

def poisson_dc(lx, ly, rho, n):
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
    return [[poisson_(lx, i)*poisson(ly, j)*DC_factor(i, j)
             for j in range(n)]
            for i in range(n)]

class CSGrid(list):

    @classmethod
    def solve(self, probs, n):
        from scipy import optimize
        def errfn(q):
            lx, ly = q
            grid=CSGrid(lx, ly, n)
            return (sum([(grid.match_odds(name)-prob)**2
                         for name, prob in zip(MOSelections,
                                               probs)])/float(3))**0.5
        return optimize.fmin(errfn, (1, 1))

    def __init__(self, lx, ly, n):
        list.__init__(self, [[poisson(lx, i)*poisson(ly, j)
                              for j in range(n)]
                             for i in range(n)])

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
        return self.sum(filterfn)
    
if __name__=="__main__":
    lx, ly = CSGrid.solve([0.5, 0.3, 0.2], 10)
    print "lx: %.5f" % lx
    print "ly: %.5f" % ly
    grid=CSGrid(lx, ly, 10)
    for selection in MOSelections:        
        print "%s: %.5f" % (selection, grid.match_odds(selection))
    

