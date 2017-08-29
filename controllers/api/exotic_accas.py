from controllers.api import *

Winner="exotic_acca_winner"

Loser="exotic_acca_loser"

Draws="exotic_acca_draws"

Win, Lose, Draw = "win", "lose", "draw"

MaxCoverage=100

PriceProbLimit=0.0001

Seed, Paths = 13, 5000

LegErrMsg="'%s' is invalid goals condition for match '%s' status"

def update_bet_params(bet):
    if bet["type"]==Winner:
        bet["result_condition"]=Win
    elif bet["type"]==Loser:
        bet["result_condition"]=Lose
    elif bet["type"]==Draws:
        bet["result_condition"]=Draw
    else:
        raise RuntimeError("Bet type not found")
            
def init_leg_filter(bet):
    def filterfn(score):
        if bet["result_condition"]==Win:
            return score[0]-score[1] >= bet["n_goals"]
        elif bet["result_condition"]==Lose:
            return score[1]-score[0] >= bet["n_goals"]
        elif bet["result_condition"]==Draw:
            return (score[0]==score[1]) and (score[0] >= bet["n_goals"])
        else:
            raise RuntimeError("Bet result not found/recognised")
    return filterfn

def init_bet_filterfn(bet):
    def bool_to_int(value):
        return 1 if value else 0
    def filterfn(scores):
        legfilterfn=init_leg_filter(bet)
        outcomes=[legfilterfn(scores[leg["selection"]])
                  for leg in bet["legs"]]
        n=len([outcome for outcome in outcomes
               if outcome])
        return bool_to_int(n >= bet["n_legs"])
    return filterfn

class BetValidator:

    def validate_type(self, bet, errors):
        if bet["type"] not in [Winner, Loser, Draws]:
            error.append("Bet type not found")
        
    def validate_legs(self, bet, matches, errors):
        matches=dict([("%s/%s" % (match["league"], match["name"]), match)
                      for match in matches])
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
                teamnames=leg["match"].split(" vs ")
                teamname=leg["selection"]
                if teamname not in teamnames:
                    errors.append("%s not found in %s" % (teamname,
                                                          matchkeyname))

    def validate_n_legs(self, bet, errors):
        if bet["n_legs"] < 0:
            errors.append("n_legs must be > 0")
        if bet["n_legs"] > len(bet["legs"]):
            errors.append("n_legs must be < length(legs)")

    def validate_n_goals(self, bet, errors):
        if bet["n_goals"] < 0:
            errors.append("n_goals must be > 0")
            
    def validate_bet(self, bet, matches):
        errors=[]
        # type
        if "type" not in bet:
            raise RuntimeError("Type not found")
        self.validate_type(bet, errors)
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
            if not isinstance(bet[attr], int):
                raise RuntimeError("%s must be an integer" % attr)
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

class BetPricer:

    def simulate_match_teams(self, fixtures, paths, seed):
        from quant.dixon_coles import CSGrid
        items=[{} for i in range(paths)]
        for fixture in fixtures:
            grid=CSGrid(fixture["dc_grid"])
            for i, score in enumerate(grid.simulate(paths, seed)):
                teamnames=fixture["name"].split(" vs ")
                items[i][teamnames[0]]=(score[0], score[1])
                items[i][teamnames[1]]=(score[1], score[0])
        return items
            
    def calc_probability(self, bet, allmatches, paths=Paths, seed=Seed):
        allmatches=dict([(match["name"], match)
                         for match in allmatches])
        matches=[]
        for leg in bet["legs"]:
            if leg["match"] not in allmatches:
                raise RuntimeError("%s not found" % leg["match"])
            matches.append(allmatches[leg["match"]])
        samples=self.simulate_match_teams(matches, paths, seed)
        filterfn=init_bet_filterfn(bet)
        return sum([filterfn(sample)
                    for sample in samples])/float(paths)
    
# curl -X POST http://localhost:8080/api/exotic_accas/price -d @dev/exotic_acca_winner.json

class PriceHandler(webapp2.RequestHandler):
                
    @parse_json_body
    @emit_json
    def post(self, bet, limit=PriceProbLimit):
        update_bet_params(bet)
        matches=load_fixtures()
        BetValidator().validate_bet(bet, matches)
        prob=BetPricer().calc_probability(bet, matches)
        price=1/float(max(limit, prob))
        return {"price": price}

# curl -X POST -H "Cookie: ioSport=Hufton123;" http://localhost:8080/api/exotic_accas/create -d @dev/exotic_acca_winner.json

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
    @emit_json
    def post(self, bet, maxcoverage=MaxCoverage, *args, **kwargs):
        userid=kwargs["user_id"]
        update_bet_params(bet)
        matches=load_fixtures()
        BetValidator().validate_bet(bet, matches)
        prob=BetPricer().calc_probability(bet, matches)
        if prob > 1/float(bet["price"]):
            raise RuntimeError("Bet not accepted")
        if bet["size"]*bet["price"] > maxcoverage:
            raise RuntimeError("Bet not accepted")
        for attr in ["result_condition",
                     "legs_condition"]:
            bet.pop(attr)
        kickoffs=self.filter_kickoffs(bet, matches)
        placedbet=ExoticAcca(userid=userid,
                             params=json.dumps(bet),
                             first_kickoff=kickoffs[0],
                             last_kickoff=kickoffs[-1],
                             size=float(bet["size"]),
                             price=float(bet["price"]),
                             timestamp=datetime.datetime.utcnow(),
                             status=Active).put()
        return {"status": "ok",
                "id": placedbet.id()}

# curl -H "Cookie: ioSport=Hufton123" "http://localhost:8080/api/exotic_accas/list?status=active"

class ListHandler(webapp2.RequestHandler):

    def load_bets(self, userid, status):
        if status==Active:
            return ExoticAcca.find_active(userid)
        elif status==Settled:
            return ExoticAcca.find_settled(userid)
        else:
            raise RuntimeError("Status not recognised")

    def status_for_leg(self, leg, results):
        key="%s/%s" % (leg["league"], leg["match"])
        return Settled if key in results else Active
        
    def outcome_for_leg(self, leg, results):
        key="%s/%s" % (leg["league"], leg["match"])
        result=results[key]
        goals=[int(token) for token in result["score"].split("-")]
        teamnames=leg["match"].split(" vs ")
        if ((leg["selection"]==teamnames[0] and
             goals[0] > goals[1]) or
            (leg["selection"]==teamnames[1] and
             goals[0] < goals[1]) or
            (leg["selection"]==Draw and
             goals[0]==goals[1])):
            return Win
        else:
            return Lose
        
    def format_bet(self, bet, status, results):
        params=json.loads(bet.params)
        for leg in params["legs"]:
            leg["status"]=self.status_for_leg(leg, results)
            if leg["status"]==Settled:
                leg["outcome"]=self.outcome_for_leg(leg, results)
        params["timestamp"]=bet.timestamp
        params["id"]=bet.key().id()        
        return params        
        
    @filter_userid
    @validate_query({'status': '(active)|(settled)'})
    @emit_json
    def get(self, *args, **kwargs):
        userid=kwargs["user_id"]
        status=self.request.get("status")
        results=dict([("%s/%s" % (result["league"], result["name"]), result)
                      for result in load_results()])        
        return [self.format_bet(bet, status, results)
                for bet in self.load_bets(userid, status)]

Routing=[('/api/exotic_accas/price', PriceHandler),
         ('/api/exotic_accas/create', CreateHandler),
         ('/api/exotic_accas/list', ListHandler)]

app=webapp2.WSGIApplication(Routing)

