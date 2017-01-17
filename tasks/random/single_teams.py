from tasks.random import *

from products.positions.single_teams import SingleTeamsProduct

from products.positions import calc_positional_probability

ProductName="single_teams"

MinProb, MaxProb = 0.05, 0.95

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
        i=int(len(Expiries)*random.random())
        expiry=Expiries[i]
        i=int(len(Leagues)*random.random())
        leaguename=Leagues[i]["name"]        
        product=SingleTeamsProduct()
        payoffs=product.init_payoffs(leaguename)
        teams=yc_lite.get_teams(leaguename)
        i=int(len(teams)*random.random())
        teamname=teams[i]["name"]
        logging.info(leaguename+"/"+teamname)
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
        items=[item for item in calc_positional_probability(struct)
              if (item["value"] > MinProb and
                  item["value"] < MaxProb)]
        logging.info(items)
        
Routing=[('/tasks/random/single_teams/init', InitHandler),
         ('/tasks/random/single_teams', IndexHandler)]

app=webapp2.WSGIApplication(Routing)
