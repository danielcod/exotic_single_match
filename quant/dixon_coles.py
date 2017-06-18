"""
http://localhost:8888/notebooks/notebooks/sportshacker/dixon_coles_adjustment.ipynb
"""

from random import Random

import math

HomeWin, Draw, AwayWin = MOSelections = ["home_win", "draw", "away_win"]

N=10

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

def rms_error(X, Y):
    return (sum([(x-y)**2 for x, y in zip(X, Y)])/float(len(X)))**0.5

class CSGrid(list):

    @classmethod
    def solve(self, probs, n=N, generations=1000, seed=13):
        rand=Random()
        rand.seed(seed)
        l, besterr = [1, 1], 1e10
        for i in range(generations):
            factor, j = ((generations-i)/float(generations))**2, i%2
            q=factor*rand.gauss(0, 1)
            l[j]+=q
            grid=CSGrid(l[0], l[1], n)
            err=rms_error([grid.match_odds(selection)
                           for selection in MOSelections], probs)
            if err < besterr:
                besterr=err
            else:
                l[j]-=q
        return l[0], l[1], besterr
    
    def __init__(self, lx, ly, n=N):
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
        else:
            raise RuntimeError("No filter fn for '%s'" % selection)
        return self.sum(filterfn)

    def simulate(self, paths, seed):
        def flatten(grid):
            items, prob = [], 0
            for i in range(len(grid)):
                for j in range(len(grid)):
                    prob+=self[i][j]
                    item=[(i, j), prob]
                    items.append(item)
            items[-1][1]=1.0 # NB
            return items
        def simulate(items, rand):
            startprob, endprob = 0, None
            q=rand.random()
            for item in items:
                endprob=item[1]
                if (q > startprob and
                    q <= endprob):
                    return item[0]
                startprob=endprob
        rand=Random()
        rand.seed(seed)        
        items=flatten(self)    
        return [simulate(items, rand)
                for i in range(paths)]
    
if __name__=="__main__":
    try:
        lx, ly, err = CSGrid.solve([0.5, 0.3, 0.2])
        print "lx: %.5f" % lx
        print "ly: %.5f" % ly
        print "err: %.5f" % err
        grid=CSGrid(lx, ly)
        print grid
        for selection in MOSelections:        
            print "%s: %.5f" % (selection, grid.match_odds(selection))
        print "samples: %s" % grid.simulate(3, 13)
    except RuntimeError, error:
        print "Error: %s" % str(error)
        
    

