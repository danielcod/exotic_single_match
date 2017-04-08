from random import Random

GDDelta=1

GDMultiplier=1e-4

NoiseMultiplier=1e-8

"""
- needs heavily unit testing
- note checks if teams exist (for minileagues, where teams are not guaranteed to be present) 
"""

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

def simulate_points(leaguetable, remfixtures, paths, rand):
    sp=dict([(team["name"], 
              [{"points": team["points"],
                "goal_diff": team["goal_diff"]}
              for i in range(paths)])
              for team in leaguetable])
    for i in range(paths):
        for fixture in remfixtures:
            hometeamname, awayteamname = fixture["name"].split(" vs ")
            probs=fixture["probabilities"]
            q=rand.random()
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

def calc_position_probabilities(simpoints, paths, rand):
    teamnames, n = sorted(simpoints.keys()), len(simpoints)
    pp=dict([(teamname, 
             [0 for i in range(n)])
            for teamname in teamnames])
    def nodevalue(item):
        nv=item["points"]
        nv+=item["goal_diff"]*GDMultiplier
        nv+=rand.uniform(-0.5, 0.5)*NoiseMultiplier
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

def simulate(teams, results, remfixtures, paths, seed):
    rand=Random()
    rand.seed(seed)
    leaguetable=sorted(calc_league_table(teams, results),
                       key=lambda x: x["name"])
    simpoints=simulate_points(leaguetable,
                              sorted(remfixtures,
                                     key=lambda x: x["name"]),
                              paths,
                              rand)
    return calc_position_probabilities(simpoints, paths, rand)

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
        """
        - yclite fixtures don't contain dates
        - more realistic option would involve loading events from db to see what games are upcoming; then filter subset of fixture by date range
        - however using full set of fixtures will do for now
        """        
        remfixtures=yclite.get_remaining_fixtures(leaguename)
        print "%i rem fixtures" % len(remfixtures)
        pp=simulate(teams, results, remfixtures, paths, seed)
        print pp
    except RuntimeError, error:
        print "Error: %s" % str(error)
