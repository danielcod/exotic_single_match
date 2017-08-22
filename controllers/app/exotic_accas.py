"""
needs to work with bet structure as specified in dev/exotic_acca_winner.json
"""

from controllers.app import *

Winner="exotic_acca_winner"
Loser="exotic_acca_loser"
Draws="exotic_acca_draws"

Win, Lose, Draw = "win", "lose", "draw"

GT, GTE, LT, LTE, EQ = ">", ">=", "<", "<=", "="

PriceProbLimit=0.0001

Seed, Paths = 13, 5000

LegErrMsg="'%s' is invalid goals condition for match '%s' status"

def init_leg_filter(bet):
    def filterfn(score):
        if bet["result_condition"]==Win:
            if bet["goals_condition"]==GT:                
                return score[0]-score[1] > bet["nGoals"]
            elif bet["goals_condition"]==GTE:                
                return score[0]-score[1] >= bet["nGoals"]
            elif bet["goals_condition"]==LT:
                return score[0]-score[1] < bet["nGoals"]
            elif bet["goals_condition"]==LTE:
                return score[0]-score[1] <= bet["nGoals"]
            elif bet["goals_condition"]==EQ:                
                return (score[0]-score[1])==bet["nGoals"]
            else:
                raise RuntimeError(LegErrMsg % (bet["goals_condition"], Win))
        elif bet["result_condition"]==Lose:
            if bet["goals_condition"]==GT:
                return score[1]-score[0] > bet["nGoals"]
            elif bet["goals_condition"]==GTE:
                return score[1]-score[0] >= bet["nGoals"]
            elif bet["goals_condition"]==LT:
                return score[1]-score[0] < bet["nGoals"]
            elif bet["goals_condition"]==LTE:
                return score[1]-score[0] <= bet["nGoals"]
            elif bet["goals_condition"]==EQ:
                return (score[1]-score[0])==bet["nGoals"]
            else:
                raise RuntimeError(LegErrMsg % (bet["goals_condition"], Lose))
        elif bet["result_condition"]==Draw:
            if bet["goals_condition"]==GT:
                return (score[0]==score[1]) and (score[0] > bet["nGoals"])
            elif bet["goals_condition"]==GTE:
                return (score[0]==score[1]) and (score[0] >= bet["nGoals"])
            elif bet["goals_condition"]==LT:
                return (score[0]==score[1]) and (score[0] < bet["nGoals"])
            elif bet["goals_condition"]==LTE:
                return (score[0]==score[1]) and (score[0] <= bet["nGoals"])
            elif bet["goals_condition"]==EQ:
                return (score[0]==score[1]) and (score[0] == bet["nGoals"])
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
        outcomes=[legfilterfn(scores[leg["selection"]["team"]])
                  for leg in bet["legs"]]
        n=len([outcome for outcome in outcomes
               if outcome])
        if bet["legs_condition"]==GT:
            return bool_to_int(n > bet["nLegs"])
        elif bet["legs_condition"]==GTE:
            return bool_to_int(n >= bet["nLegs"])
        elif bet["legs_condition"]==LT:
            return bool_to_int(n < bet["nLegs"])
        elif bet["legs_condition"]==LTE:
            return bool_to_int(n <= bet["nLegs"])
        elif bet["legs_condition"]==EQ:
            return bool_to_int(n==bet["nLegs"])
        else:
            raise RuntimeError("%s is invalid legs condition" % bet["legs_condition"])
    return filterfn

# curl -X POST http://localhost:8080/app/exotic_accas/price -d @dev/exotic_acca_winner.json

class PriceHandler(webapp2.RequestHandler):

    def validate_legs(self, bet, matches, errors):
        matches=dict([("%s/%s" % (match["league"], match["name"]), match)
                      for match in matches])
        now=datetime.datetime.utcnow()
        for leg in bet["legs"]:
            matchkeyname="%s/%s" % (leg["match"]["league"],
                                    leg["match"]["name"])
            if matchkeyname not in matches:
                errors.append("%s not found" % matchkeyname)
            else:
                # check kickoff
                if matches[matchkeyname]["kickoff"] < now:
                    # errors.append("%s has already started" % matchkeyname)
                    pass
                # check team names
                teamnames=leg["match"]["name"].split(" vs ")
                teamname=leg["selection"]["team"]
                if teamname not in teamnames:
                    errors.append("%s not found in %s" % (teamname,
                                                          matchkeyname))

    def validate_bet(self, bet, matches):
        errors=[]
        if bet["name"] not in [Winner, Loser, Draws]:
            error.append("Bet type not found")
        self.validate_legs(bet, matches, errors)
        if errors!=[]:
            raise RuntimeError("; ".join(errors))
            
    def update_bet(self, bet):
        bet["legs_condition"]=bet["goals_condition"]=GTE
        name=bet.pop("name")
        if name==Winner:
            bet["result_condition"]=Win
        elif name==Loser:
            bet["result_condition"]=Lose
        elif name==Draws:
            bet["result_condition"]=Draw
        else:
            raise RuntimeError("Bet type not found")
            
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
            if leg["match"]["name"] not in allmatches:
                raise RuntimeError("%s not found" % leg["match"]["name"])
            matches.append(allmatches[leg["match"]["name"]])
        samples=self.simulate_match_teams(matches, paths, seed)
        filterfn=init_bet_filterfn(bet)
        return sum([filterfn(sample)
                    for sample in samples])/float(paths)
    
    @parse_json_body
    @emit_json
    def post(self, bet, limit=PriceProbLimit):
        matches=Blob.fetch("app/matches")
        self.validate_bet(bet, matches)
        self.update_bet(bet)
        prob=self.calc_probability(bet,
                                   matches,
                                   seed=Seed,
                                   paths=Paths)
        price=1/float(max(limit, prob))
        return {"price": price}

Routing=[('/app/exotic_accas/price', PriceHandler)]

app=webapp2.WSGIApplication(Routing)

