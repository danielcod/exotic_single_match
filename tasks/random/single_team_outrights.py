from tasks.random import *

from models.products.positions import calc_positional_probability

from models.products.positions.single_team_outrights import SingleTeamOutrightProduct

MinProb, MaxProb = 0.05, 0.95

# curl "http://localhost:8080/tasks/random/single_team_outrights?n=10"

class IndexHandler(webapp2.RequestHandler):

    @validate_query({'n': '\\d+'})
    @task
    def get(self):
        n=int(self.request.get("n"))
        tasks=[taskqueue.add(url="/tasks/random/single_team_outrights/init")
               for i in range(n)]
        logging.info("%s league tasks started" % n)

class InitHandler(webapp2.RequestHandler):

    """
    - this should be moved into product model
    """
    
    def calc_prices(self, leaguename, teamname, expiry, teams, payoffs):
        results=yc_lite.get_results(leaguename)        
        fixtures=[{"name": fixture["name"],
                   "date": fixture["date"],
                   "probabilities": fixture["yc_probabilities"]}
                   for fixture in [fixture.to_json()
                                   for fixture in Fixture.find_all(leaguename)]]
        today=datetime.date.today()
        fixtures=[fixture for fixture in fixtures
                  if (fixture["date"] > today and
                      fixture["date"] < expiry["value"])]
        struct={"team": {"league": leaguename,
                         "name": teamname},
                "teams": teams,
                "results": results,
                "fixtures": fixtures,
                "payoffs": payoffs}
        return [item for item in calc_positional_probability(struct)
                if (item["value"] > MinProb and
                    item["value"] < MaxProb)]
    
    def group_items(self, item):
        def item_group_name(name):
            if name in ["Winner", "Promotion", "Relegation", "Bottom"]:
                return "Main"
            elif (name.startswith("Top") or
                  name.startswith("Outside Top")):
                return "Top"
            elif (name.startswith("Bottom") or
                  name.startswith("Outside Bottom")):
                return "Bottom"
            elif name.endswith("Place"):
                return "Place"
            else:
                raise RuntimeError("No group key for '%s'" % name)
        groups={}
        for item in item:
            groupname=item_group_name(item["name"])
            groups.setdefault(groupname, [])
            groups[groupname].append(item)
        return groups

    def random_groupname(self, groups):
        groupnames=sorted(groups.keys())
        if "Main" in groupnames:
            return "Main"
        else:            
            i=int(len(groupnames)*random.random())
            return groupnames[i]
    
    @task
    def post(self):
        random.seed(random_seed())
        i=int(len(Expiries)*random.random())
        expiry=Expiries[i]
        i=int(len(Leagues)*random.random())
        leaguename=Leagues[i]["name"]        
        payoffs=SingleTeamOutrightProduct.init_payoffs(leaguename)
        teams=yc_lite.get_teams(leaguename)
        i=int(len(teams)*random.random())
        teamname=teams[i]["name"]
        allitems=self.calc_prices(leaguename,
                                  teamname,
                                  expiry,
                                  teams,
                                  payoffs)
        groups=self.group_items(allitems)
        groupname=self.random_groupname(groups)
        items=groups[groupname]
        i=int(len(items)*random.random())
        payoffname=items[i]["name"]
        probability=items[i]["value"]
        price=format_price(probability)
        SingleTeamOutrightProduct(league=leaguename,
                                   team=teamname,
                                   payoff=payoffname,
                                   expiry=expiry["value"],
                                   price=price).put()
        logging.info("%s/%s/%s/%s -> %s" % (leaguename,
                                            teamname,
                                            payoffname,
                                            expiry["value"],
                                            price))
        
Routing=[('/tasks/random/single_team_outrights/init', InitHandler),
         ('/tasks/random/single_team_outrights', IndexHandler)]

app=webapp2.WSGIApplication(Routing)
