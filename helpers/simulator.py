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
            table[hometeamname]["points"]+=3
        elif goals[0] < goals[1]:
            table[awayteamname]["points"]+=3
        else:
            table[hometeamname]["points"]+=1
            table[awayteamname]["points"]+=1
        table[hometeamname]["goal_diff"]+=goals[0]-goals[1]
        table[awayteamname]["goal_diff"]+=goals[1]-goals[0]
        table[hometeamname]["played"]+=1
        table[awayteamname]["played"]+=1
    return table.values()

def simulate_points(leaguetable, remfixtures, paths):
    sp=dict([(team["name"], 
              [{"points": team["points"],
                "goal_diff": team["goal_diff"]}
              for i in range(paths)])
              for team in leaguetable])
    for i in range(paths):
        for fixture in remfixtures:
            hometeamname, awayteamname = fixture["name"].split(" vs ")
            probs=fixture["probabilities"]
            q=random.random()
            if q < probs[0]: # home win
                sp[hometeamname][i]["points"]+=3
                sp[hometeamname][i]["goal_diff"]+=GDDelta
                sp[awayteamname][i]["goal_diff"]-=GDDelta
            elif q < probs[0]+probs[1]: # draw
                sp[hometeamname][i]["points"]+=1
                sp[awayteamname][i]["points"]+=1
            else: # away win
                sp[awayteamname][i]["points"]+=3
                sp[awayteamname][i]["goal_diff"]+=GDDelta
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

def simulate(teams, results, remfixtures, paths, seed):
    random.seed(seed)
    leaguetable=calc_league_table(teams, results)
    simpoints=simulate_points(leaguetable, remfixtures, paths)
    return calc_position_probabilities(simpoints, paths)

if __name__=="__main__":
    try:
        from google.appengine.ext import testbed
        tb=testbed.Testbed()
        tb.activate()
        tb.init_urlfetch_stub()
        tb.init_memcache_stub()
        import sys, re
        if len(sys.argv) < 4:
            raise RuntimeError("Please enter leaguename, paths, seed")
        leaguename, paths, seed = sys.argv[1:4]
        if not re.search("^\\D{3}\\.\\d$", leaguename):
            raise RuntimeError("Leaguename is invalid")
        if not re.search("^\\d+$", paths):
            raise RuntimeError("Paths is invalid")
        paths=int(paths)
        if not re.search("^\\d+$", seed):
            raise RuntimeError("Seed is invalid")
        seed=int(seed)        
        import apis.yc_lite_api as yclite
        teams=yclite.get_teams(leaguename)
        print "%i teams" % len(teams)
        results=yclite.get_results(leaguename)
        print "%i results" % len(results)
        remfixtures=yclite.get_remaining_fixtures(leaguename)
        print "%i rem fixtures" % len(results)
        pp=simulate(teams, results, remfixtures, paths, seed)
        print pp
    except RuntimeError, error:
        print "Error: %s" % str(error)
