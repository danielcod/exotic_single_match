from products.positions import *

class SingleTeamsProduct:

    def init_payoffs(self, leaguename, teamname=None):
        teams=fetch_teams(leaguename)
        names=[]
        names.append("Winner")
        if leaguename in Promotion:
            names.append("Promotion")
        if leaguename in Relegation:
            names.append("Relegation")
        for i in range(2, 1+len(teams)/2):
            names.append("Top %i" % i)
        for i in range(2, 1+len(teams)/2):
            names.append("Outside Top %i" % i)
        names.append("Bottom")
        for i in range(2, 1+len(teams)/2):
            names.append("Bottom %i" % i)
        for i in range(2, 1+len(teams)/2):
            names.append("Outside Bottom %i" % i)
        for i in range(2, len(teams)):
            names.append("%i%s Place" % (i, cardinal_suffix(i)))
        return [{"name": name}
                for name in names]

    def calc_probability(self, query):
        team={"league": query["league"],
              "name": query["team"]}
        teams=fetch_teams(query["league"])
        results=fetch_results(query["league"])
        fixtures=[fixture
                  for fixture in fetch_fixtures(query["league"])
                  if (fixture["date"] > Today and
                      fixture["date"] <= query["expiry"])]
        payoffs=[{"name": query["payoff"]}]
        struct={"team": team,
                "teams": teams,
                "results": results,
                "fixtures": fixtures,
                "payoffs": payoffs}
        resp=calc_positional_probability(struct)
        return resp[0]["value"]

