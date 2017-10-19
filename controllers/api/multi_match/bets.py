from controllers.api.multi_match import *

MaxCoverage=10000

PriceProbLimit=0.0001

class MultiMatchBetValidator:

    def validate_legs(self, bet, matches, errors):
        matches=dict([("%s/%s" % (match["league"], match["name"]), match)
                      for match in matches])
        product=getattr(products, Products[bet["type"]])(bet)
        now=datetime.datetime.utcnow()
        for leg in bet["legs"]:
            matchkeyname="%s/%s" % (leg["league"],
                                    leg["match"])
            if matchkeyname not in matches:
                errors.append("%s not found" % matchkeyname)
            else:
                # check kickoff
                if matches[matchkeyname]["kickoff"] < now:
                    # errors.append("%s has already started" % matchkeyname)
                    pass
                # check team names
                if product.has_selection:
                    if "selection" in leg:
                        teamnames=leg["match"].split(" vs ")
                        teamname=leg["selection"]
                        if teamname not in teamnames:
                            errors.append("%s not found in %s" % (teamname,
                                                                  matchkeyname))
                    else:                        
                        errors.append("Selection not specified")

    def validate_n_legs(self, bet, errors):
        if bet["n_legs"] < 0:
            errors.append("n_legs must be > 0")
        if bet["n_legs"] > len(bet["legs"]):
            errors.append("n_legs must be < length(legs)")
        if not isinstance(bet["n_legs"], int):
            raise RuntimeError("n_legs must be an integer")
            
    def validate_n_goals(self, bet, errors):
        if bet["n_goals"] < 0:
            errors.append("n_goals must be > 0")
        if type(bet["n_goals"]) not in [int, float]:
            raise RuntimeError("n_goals must be an integer or a float")
            
    def validate_bet(self, bet, matches):
        errors=[]
        # type
        if "type" not in bet:
            raise RuntimeError("Type not found")
        if bet["type"] not in Products:
            raise RuntimeError("Type not recognised")
        # legs
        if "legs" not in bet:
            raise RuntimeError("Legs not found")
        if not isinstance(bet["legs"], list):
            raise RuntimeError("Legs must be a list")
        self.validate_legs(bet, matches, errors)
        # n_x attrs
        for attr in ["n_legs", "n_goals"]:
            if attr not in bet:
                raise RuntimeError("%s not found" % attr)
        self.validate_n_legs(bet, errors)
        self.validate_n_goals(bet, errors)
        # size, price
        for attr in ["size", "price"]:
            if attr in bet:
                if type(bet[attr]) not in [int, float]:
                    raise RuntimeError("%s must be an int/float" % attr)
        # return
        if errors!=[]:
            raise RuntimeError("; ".join(errors))

class MultiMatchBetPricer:

    """
    NB increment seeds for each match to avoid having 100% correlated match outcomes!
    """
    
    def simulate_matches(self, fixtures, paths, seed):
        items=[{} for i in range(paths)]
        for i, fixture in enumerate(fixtures):
            grid=CSGrid(fixture["dc_grid"])
            for j, score in enumerate(grid.simulate(paths, seed+i)):
                items[j][fixture["name"]]=score
        return items
                
    def calc_probability(self, bet, allmatches, paths=Paths, seed=Seed):
        allmatches=dict([(match["name"], match)
                         for match in allmatches])
        matches=[]
        for leg in bet["legs"]:
            if leg["match"] not in allmatches:
                raise RuntimeError("%s not found" % leg["match"])
            matches.append(allmatches[leg["match"]])
        samples=self.simulate_matches(matches, paths, seed)
        product=getattr(products, Products[bet["type"]])(bet)
        def filterfn(scores):
            values=[int(product.sim_payoff(leg, scores[leg["match"]]))
                    for leg in bet["legs"]]
            return int(sum(values) >= bet["n_legs"])   
        return sum([filterfn(sample)
                    for sample in samples])/float(paths)

# curl -X POST http://localhost:8080/api/multi_match/bets/price -d @tmp/multi_match_bet.json

class PriceHandler(webapp2.RequestHandler):
    
    @parse_json_body
    # @add_cors_headers
    @emit_json
    def post(self, bet, limit=PriceProbLimit):
        product=getattr(products, Products[bet["type"]])(bet)
        matches=load_fixtures()
        MultiMatchBetValidator().validate_bet(bet, matches)
        prob=MultiMatchBetPricer().calc_probability(bet, matches)
        price=1/float(max(limit, prob))        
        return {"price": price,                
                "description": product.description,
                "short_description": product.short_description}

# curl -X POST -H "Cookie: ioSport=Hufton123;" http://localhost:8080/api/multi_match/bets/create -d @tmp/multi_match_bet.json

class CreateHandler(webapp2.RequestHandler):

    def filter_kickoffs(self, bet, matches):
        kickoffs=dict([("%s/%s" % (match["league"], match["name"]),
                        match["kickoff"])
                       for match in matches])
        return sorted(list(set([kickoffs["%s/%s" % (leg["league"],
                                                    leg["match"])]
                                for leg in bet["legs"]])))
        
    @filter_userid
    @parse_json_body
    # @add_cors_headers
    @emit_json
    def post(self, bet, maxcoverage=MaxCoverage, *args, **kwargs):
        product=getattr(products, Products[bet["type"]])(bet)
        userid=kwargs["user_id"]
        matches=load_fixtures()
        MultiMatchBetValidator().validate_bet(bet, matches)
        prob=MultiMatchBetPricer().calc_probability(bet, matches)
        #if prob > 1/float(bet["price"]):
        #    raise RuntimeError("Bet not accepted")
        if bet["size"]*bet["price"] > maxcoverage:
            raise RuntimeError("Bet not accepted")
        kickoffs=self.filter_kickoffs(bet, matches)
        placedbet=MultiMatchBet(userid=userid,
                             params=json.dumps(bet),
                             first_kickoff=kickoffs[0],
                             last_kickoff=kickoffs[-1],
                             size=float(bet["size"]),
                             price=float(bet["price"]),
                             timestamp=datetime.datetime.utcnow(),
                             status=Active).put()
        return {"status": "ok",
                "id": placedbet.id(),
                "description": product.description,
                "short_description": product.short_description}

# curl -H "Cookie: ioSport=Hufton123" "http://localhost:8080/api/multi_match/bets/list?status=active"

class ListHandler(webapp2.RequestHandler):

    def load_bets(self, userid, status):
        if status==Active:
            return MultiMatchBet.find_active(userid)
        elif status==Settled:
            return MultiMatchBet.find_settled(userid)
        else:
            raise RuntimeError("Status not recognised")

    def format_bet(self, bet, results):
        betparams=json.loads(bet.params)
        product=getattr(products, Products[betparams["type"]])(betparams)
        params=dict([(attr, betparams[attr])                     
                     for attr in ["type",
                                  "legs",
                                  "n_legs",
                                  "n_goals",
                                  "size",
                                  "price"]])
        params["description"]=product.description
        params["short_description"]=product.short_description
        params["timestamp"]=bet.timestamp
        params["id"]=bet.key().id()
        for leg in params["legs"]:
            key="%s/%s" % (leg["league"], leg["match"])
            leg["status"]=Settled if key in results else Active
            if leg["status"]==Settled:
                leg["outcome"]=Win if product.sim_payoff(leg, results["key"]["score"]) else Lose
        return params
        
    @filter_userid
    @validate_query({'status': '(active)|(settled)'})
    # @add_cors_headers
    @emit_json
    def get(self, *args, **kwargs):
        userid=kwargs["user_id"]
        status=self.request.get("status")
        results=dict([("%s/%s" % (result["league"], result["name"]), result)
                      for result in load_results()])
        return [self.format_bet(bet, results)
                for bet in self.load_bets(userid, status)]

Routing=[('/api/multi_match/bets/price', PriceHandler),
         ('/api/multi_match/bets/create', CreateHandler),
         ('/api/multi_match/bets/list', ListHandler)]

app=webapp2.WSGIApplication(Routing)

