from quant.dixon_coles import CSGrid

import yaml

Fixtures=yaml.load("""
- name: A vs B
  dc_poisson_means:
  - 1.5
  - 0.5
- name: C vs D
  dc_poisson_means:
  - 0.75
  - 0.75
- name: E vs F
  dc_poisson_means:
  - 0.75
  - 1.5 
""")

def simulate(fixtures, paths, seed):
    grids=[CSGrid(*tuple(fixture["dc_poisson_means"]))
           for fixture in fixtures]
    def rotate(grid):
        newgrid=[]
        for i in range(len(grid)):
            for j in range(len(grid[i])):
                if j >= len(newgrid):
                    newgrid.append([])
                newgrid[j].append(grid[i][j])
        return newgrid
    return rotate([grid.simulate(paths, seed)
                   for grid in grids])
    
if __name__=="__main__":
    print simulate(Fixtures, 10, 13)
