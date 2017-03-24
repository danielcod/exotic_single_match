from helpers.json_helpers import *

if __name__=="__main__":
    teams=json_loads(file("tmp/teams.json").read())
    results=json_loads(file("tmp/results.json").read())
    remfixtures=json_loads(file("tmp/remfixtures.json").read())
    struct={}
    struct["teams"]=[{"name": team["name"]}
                     for team in teams]
    struct["results"]=[{"name": result["name"],
                        "score": result["score"]}
                       for result in results]
    struct["fixtures"]=remfixtures
    dest=file("tmp/request.json", 'w')
    dest.write(json_dumps(struct))
    dest.close()
