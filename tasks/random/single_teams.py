from tasks.random import *

from products.positions.single_teams import SingleTeamsProduct

Product=SingleTeamsProduct()

MinProb, MaxProb = 0.25, 0.75

ProductName="single_teams"

def payoff_group_name(payoffname):
    if payoffname in ["Winner", "Promotion", "Relegation", "Bottom"]:
        return "Main"
    elif (payoffname.startswith("Top") or
          payoffname.startswith("Outside Top")):
        return "Top"
    elif (payoffname.startswith("Bottom") or
          payoffname.startswith("Outside Bottom")):
        return "Bottom"
    elif payoffname.endswith("Place"):
        return "Place"
    else:
        raise RuntimeError("No group key for '%s'" % payoffname)

def group_payoffs(payoff):
    groups={}
    for payoff in payoff:
        groupname=payoff_group_name(payoff["name"])
        groups.setdefault(groupname, [])
        groups[groupname].append(payoff)
    return groups
        
# curl "http://localhost:8080/tasks/random/single_teams?n=1"

class IndexHandler(webapp2.RequestHandler):

    @validate_query({'n': '\\d+'})
    @task
    def get(self):
        n=int(self.request.get("n"))
        tasks=[taskqueue.add(url="/tasks/random/single_teams/init")
               for i in range(n)]
        logging.info("%s league tasks started" % n)

class InitHandler(webapp2.RequestHandler):

    @task
    def post(self):
        random.seed(random_seed())
        i=int(len(Leagues)*random.random())
        leaguename=Leagues[i]["name"]
        teams=yc_lite.get_teams(leaguename)
        i=int(len(teams)*random.random())
        teamname=teams[i]["name"]
        allpayoffs=Product.init_payoffs(leaguename, teamname)
        filteredpayoffs=[payoff for payoff in allpayoffs
                         if (payoff["value"] > MinProb and
                             payoff["value"] < MaxProb)]        
        payoffgroups=group_payoffs(filteredpayoffs)
        payoffgroupnames=sorted(payoffgroups.keys())
        if "Main" in payoffgroupnames:
            payoffgroupname="Main"
        else:
            i=int(len(payoffgroupnames)*random.random())
            payoffgroupname=payoffgroupnames[i]
        payoffs=payoffgroups[payoffgroupname]
        i=int(len(payoffs)*random.random())
        payoffname=payoffs[i]["name"]
        i=int(len(Expiries)*random.random())
        expiryvalue=Expiries[i]["value"]        
        query={"league": leaguename,
               "team": teamname,
               "payoff": payoffname,
               "expiry": expiryvalue}
        priceresp=Product.price_contract(query)
        price=priceresp[0]["value"]
        Contract(product=ProductName,
                 query=json_dumps(query),
                 probability=price).put()
        logging.info("%s: %s -> %.3f" % (ProductName,
                                         query,
                                         price))

Routing=[('/tasks/random/single_teams/init', InitHandler),
         ('/tasks/random/single_teams', IndexHandler)]

app=webapp2.WSGIApplication(Routing)
