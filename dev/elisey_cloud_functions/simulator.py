import random

GDDelta=1
GDMultiplier=1e-4
NoiseMultiplier=1e-8

def calc_league_table(teams, results):
    table=dict([(team["name"],
                 {"name": team["name"],
                  "points": 0,
                  "goal_diff": 0,
                  "played": 0})
                for team in teams])
    for result in results:
        hometeamname, awayteamname = result["name"].split(" vs ")
        goals=result["score"]
        if goals[0] > goals[1]:
            if hometeamname in table:
                table[hometeamname]["points"]+=3
        elif goals[0] < goals[1]:
            if awayteamname in table:
                table[awayteamname]["points"]+=3
        else:
            if hometeamname in table:
                table[hometeamname]["points"]+=1
            if awayteamname in table:
                table[awayteamname]["points"]+=1
        if hometeamname in table:
            table[hometeamname]["goal_diff"]+=goals[0]-goals[1]
            table[hometeamname]["played"]+=1
        if awayteamname in table:
            table[awayteamname]["goal_diff"]+=goals[1]-goals[0]
            table[awayteamname]["played"]+=1
    return table.values()

def simulate_points(leaguetable, fixtures, paths):
    sp=dict([(team["name"], 
              [{"points": team["points"],
                "goal_diff": team["goal_diff"]}
              for i in range(paths)])
              for team in leaguetable])
    for i in range(paths):
        for fixture in fixtures:
            hometeamname, awayteamname = fixture["name"].split(" vs ")
            probs=fixture["probabilities"]
            q=random.random()
            if q < probs[0]: # home win
                if hometeamname in sp:
                    sp[hometeamname][i]["points"]+=3
                    sp[hometeamname][i]["goal_diff"]+=GDDelta
                if awayteamname in sp:
                    sp[awayteamname][i]["goal_diff"]-=GDDelta
            elif q < probs[0]+probs[1]: # draw
                if hometeamname in sp:
                    sp[hometeamname][i]["points"]+=1
                if awayteamname in sp:
                    sp[awayteamname][i]["points"]+=1
            else: # away win
                if awayteamname in sp:
                    sp[awayteamname][i]["points"]+=3
                    sp[awayteamname][i]["goal_diff"]+=GDDelta
                if hometeamname in sp:
                    sp[hometeamname][i]["goal_diff"]-=GDDelta
    return sp

def calc_position_probabilities(simpoints, paths):
    teamnames, n = sorted(simpoints.keys()), len(simpoints)
    pp=dict([(teamname, 
             [0 for i in range(n)])
            for teamname in teamnames])
    def nodevalue(item):
        nv=item["points"]
        nv+=item["goal_diff"]*GDMultiplier
        nv+=random.uniform(-0.5, 0.5)*NoiseMultiplier
        return nv
    for i in range(paths):
        nodevalues=sorted([(key, nodevalue(item[i]))
                            for key, item in simpoints.items()],
                           key=lambda x: -x[-1])
        for j in range(n):
            name=nodevalues[j][0]
            pp[name][j]+=1/float(paths)
    return pp

"""
- NB data must be sorted for consistent application of random numbers to teams / consistent results
"""

def simulate(teams, results, fixtures, paths, seed):
    random.seed(seed)
    leaguetable=sorted(calc_league_table(teams, results),
                       key=lambda x: x["name"])
    simpoints=simulate_points(leaguetable,
                              sorted(fixtures,
                                     key=lambda x: x["name"]),
                              paths)
    return calc_position_probabilities(simpoints, paths)

if __name__=="__main__":
    try:
        import json, os, sys
        if len(sys.argv) < 2:
            raise RuntimeError("Please supply request file")
        filename=sys.argv[1]
        if not os.path.exists(filename):
            raise RuntimeError("File does not exist")
        if not filename.endswith(".json"):
            raise RuntimeError("File must be a JSON file")
        """
        try:
            request=json.loads(file(filename)).read()
        except:
            raise RuntimeError("Error loading JSON file")
        """
        request=json.loads(file(filename).read())
        try:
            pp=simulate(**request)
            print pp
        except:
            raise RuntimeError("Error running simulator")
    except RuntimeError, error:
        print "Error: %s" % str(error)
