"""
- http://localhost:8888/notebooks/notebooks/sportshacker/dixon_coles_adjustment.ipynb
- this isn't really Dixon Coles as doesn't use Dixon Coles adjustment :-/
- problem is a 2- factor solver is easy to hack but a 3- factor one isn't unless you use scipy.optimize; and scipy not available on App Engine Standard :-(
"""

from quant.multi_match import *

from random import Random

import math, unittest

N=10

def poisson(l, x):
    return (l**x)*math.exp(-l)/math.factorial(x)

class CSGrid(list):

    @classmethod
    def solve(self, probs, n=N, generations=1000, seed=13):
        def rms_error(X, Y):
            return (sum([(x-y)**2 for x, y in zip(X, Y)])/float(len(X)))**0.5
        rand=Random()
        rand.seed(seed)
        l, besterr = [1, 1], 1e10
        for i in range(generations):
            factor, j = ((generations-i)/float(generations))**2, i%2
            q=factor*rand.gauss(0, 1)
            l[j]+=q
            grid=CSGrid.from_poisson(l[0], l[1], n)
            err=rms_error([grid.home_win, grid.draw, grid.away_win], probs)
            if err < besterr:
                besterr=err
            else:
                l[j]-=q
        return l[0], l[1], besterr

    @classmethod
    def from_poisson(self, lx, ly, n=N):
        return CSGrid([[poisson(lx, i)*poisson(ly, j)
                        for j in range(n)]
                       for i in range(n)])

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

    def sum(self, filterfn):
        return sum([self[i][j]                    
                    for i in range(len(self))
                    for j in range(len(self))
                    if filterfn(i, j)])
    
    @property
    def home_win(self):
        return self.sum(lambda i, j: i > j)

    @property
    def draw(self):
        return self.sum(lambda i, j: i==j)

    @property
    def away_win(self):
        return self.sum(lambda i, j: i < j)

class DCTest(unittest.TestCase):

    def test_solve(self, probs=[0.5, 0.3, 0.2]):
        lx, ly, err = CSGrid.solve(probs)
        self.assertTrue(abs(err) < 1e-5)
        grid=CSGrid.from_poisson(lx, ly)
        for i, selection in enumerate(["home_win",
                                       "draw",
                                       "away_win"]):
            self.assertAlmostEqual(probs[i],
                                   getattr(grid, selection),
                                   places=4)

    def test_simulate(self,
                      probs=[0.5, 0.3, 0.2],
                      seed=13,
                      paths=10000):
        lx, ly, err = CSGrid.solve(probs)
        self.assertTrue(abs(err) < 1e-5)
        grid=CSGrid.from_poisson(lx, ly)
        samples=grid.simulate(paths=paths, seed=seed)
        def calc_prob(filterfn):
            return sum([filterfn(q)
                        for q in samples])/float(paths)
        for i, filterfn in enumerate([lambda x: x[0] > x[1],
                                      lambda x: x[0]==x[1],
                                      lambda x: x[0] < x[1]]):
            self.assertAlmostEqual(probs[i],
                                   calc_prob(filterfn),
                                   places=2)

if __name__=="__main__":
    unittest.main()
        
    

