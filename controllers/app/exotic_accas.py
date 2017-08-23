from controllers.app import *

Winner="exotic_acca_winner"
Loser="exotic_acca_loser"
Draws="exotic_acca_draws"

Win, Lose, Draw = "win", "lose", "draw"

GT, GTE, LT, LTE, EQ = ">", ">=", "<", "<=", "="

MaxCoverage=100

PriceProbLimit=0.0001

Seed, Paths = 13, 5000

LegErrMsg="'%s' is invalid goals condition for match '%s' status"

def update_bet_params(bet):
    bet["legs_condition"]=bet["goals_condition"]=GTE
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
            if bet["goals_condition"]==GT:                
                return score[0]-score[1] > bet["n_goals"]
            elif bet["goals_condition"]==GTE:                
                return score[0]-score[1] >= bet["n_goals"]
            elif bet["goals_condition"]==LT:
                return score[0]-score[1] < bet["n_goals"]
            elif bet["goals_condition"]==LTE:
                return score[0]-score[1] <= bet["n_goals"]
            elif bet["goals_condition"]==EQ:                
                return (score[0]-score[1])==bet["n_goals"]
            else:
                raise RuntimeError(LegErrMsg % (bet["goals_condition"], Win))
        elif bet["result_condition"]==Lose:
            if bet["goals_condition"]==GT:
                return score[1]-score[0] > bet["n_goals"]
            elif bet["goals_condition"]==GTE:
                return score[1]-score[0] >= bet["n_goals"]
            elif bet["goals_condition"]==LT:
                return score[1]-score[0] < bet["n_goals"]
            elif bet["goals_condition"]==LTE:
                return score[1]-score[0] <= bet["n_goals"]
            elif bet["goals_condition"]==EQ:
                return (score[1]-score[0])==bet["n_goals"]
            else:
                raise RuntimeError(LegErrMsg % (bet["goals_condition"], Lose))
        elif bet["result_condition"]==Draw:
            if bet["goals_condition"]==GT:
                return (score[0]==score[1]) and (score[0] > bet["n_goals"])
            elif bet["goals_condition"]==GTE:
                return (score[0]==score[1]) and (score[0] >= bet["n_goals"])
            elif bet["goals_condition"]==LT:
                return (score[0]==score[1]) and (score[0] < bet["n_goals"])
            elif bet["goals_condition"]==LTE:
                return (score[0]==score[1]) and (score[0] <= bet["n_goals"])
            elif bet["goals_condition"]==EQ:
                return (score[0]==score[1]) and (score[0] == bet["n_goals"])
            else:
                raise RuntimeError(errmsg % (bet["goals_condition"], Draw))
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
        if bet["legs_condition"]==GT:
            return bool_to_int(n > bet["n_legs"])
        elif bet["legs_condition"]==GTE:
            return bool_to_int(n >= bet["n_legs"])
        elif bet["legs_condition"]==LT:
            return bool_to_int(n < bet["n_legs"])
        elif bet["legs_condition"]==LTE:
            return bool_to_int(n <= bet["n_legs"])
        elif bet["legs_condition"]==EQ:
            return bool_to_int(n==bet["n_legs"])
        else:
            raise RuntimeError("%s is invalid legs condition" % bet["legs_condition"])
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
        # attrs
        for attr in ["n_legs", "n_goals"]:
            if attr not in bet:
                raise RuntimeError("%s not found" % attr)
            if not isinstance(bet[attr], int):
                raise RuntimeError("%s must be an integer" % attr)
        self.validate_n_legs(bet, errors)
        self.validate_n_goals(bet, errors)
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
    
# curl -X POST http://localhost:8080/app/exotic_accas/price -d @dev/exotic_acca_winner.json

class PriceHandler(webapp2.RequestHandler):
                
    @parse_json_body
    @emit_json
    def post(self, bet, limit=PriceProbLimit):
        update_bet_params(bet)
        matches=Blob.fetch("app/matches")
        BetValidator().validate_bet(bet, matches)
        prob=BetPricer().calc_probability(bet, matches)
        price=1/float(max(limit, prob))
        return {"price": price}

# curl -X POST -H "Cookie: ioSport=Hufton123;" http://localhost:8080/app/exotic_accas/create -d @dev/exotic_acca_winner.json

class CreateHandler(webapp2.RequestHandler):

    @filter_userid
    @parse_json_body
    @emit_json
    def post(self, bet, maxcoverage=MaxCoverage, *args, **kwargs):
        userid=kwargs["user_id"]
        update_bet_params(bet)
        matches=Blob.fetch("app/matches")
        BetValidator().validate_bet(bet, matches)
        prob=BetPricer().calc_probability(bet, matches)
        if prob > 1/float(bet["price"]):
            raise RuntimeError("Bet not accepted")
        if bet["size"]*bet["price"] > maxcoverage:
            raise RuntimeError("Bet not accepted")
        for attr in ["result_condition",
                     "goals_condition",
                     "legs_condition"]:
            bet.pop(attr)
        placedbet=ExoticAcca(userid=userid,
                             params=json.dumps(bet),
                             size=float(bet["size"]),
                             price=float(bet["price"]),
                             timestamp=datetime.datetime.utcnow()).put()
        return {"status": "ok",
                "id": placedbet.id()}

# curl -H "Cookie: ioSport=Hufton123" http://localhost:8080/app/exotic_accas/list

class ListHandler(webapp2.RequestHandler):

    @filter_userid
    @emit_json
    def get(self, *args, **kwargs):
        userid=kwargs["user_id"]
        def format_bet(bet):
            params=json.loads(bet.params)
            params["timestamp"]=bet.timestamp.strftime("%Y-%m-%d %H:%M:%S")
            params["id"]=bet.key().id()
            return params
        return [format_bet(bet)
                for bet in ExoticAcca.find_all(userid)]

Routing=[('/app/exotic_accas/price', PriceHandler),
         ('/app/exotic_accas/create', CreateHandler),
         ('/app/exotic_accas/list', ListHandler)]

app=webapp2.WSGIApplication(Routing)

