from controllers.app import *

Winner="exotic_acca_winner"
Loser="exotic_acca_loser"
Draws="exotic_acca_draws"

Win, Lose, Draw = "win", "lose", "draw"

GT, GTE, LT, LTE, EQ = ">", ">=", "<", "<=", "="

Conditions={
    GT: "more than",
    GTE: "at least",
    LT: "less than",
    LTE: "at most",
    EQ: "exactly"
}

Seed, Paths = 13, 5000

LegErrMsg="'%s' is invalid goals condition for match '%s' status"

def init_leg_filter(bet):
    def filterfn(score):
        if bet["resultCondition"]==Win:
            if bet["goalsCondition"]==GT:                
                return score[0]-score[1] > bet["nGoals"]
            elif bet["goalsCondition"]==GTE:                
                return score[0]-score[1] >= bet["nGoals"]
            elif bet["goalsCondition"]==LT:
                return score[0]-score[1] < bet["nGoals"]
            elif bet["goalsCondition"]==LTE:
                return score[0]-score[1] <= bet["nGoals"]
            elif bet["goalsCondition"]==EQ:                
                return (score[0]-score[1])==bet["nGoals"]
            else:
                raise RuntimeError(LegErrMsg % (bet["goalsCondition"], Win))
        elif bet["resultCondition"]==Lose:
            if bet["goalsCondition"]==GT:
                return score[1]-score[0] > bet["nGoals"]
            elif bet["goalsCondition"]==GTE:
                return score[1]-score[0] >= bet["nGoals"]
            elif bet["goalsCondition"]==LT:
                return score[1]-score[0] < bet["nGoals"]
            elif bet["goalsCondition"]==LTE:
                return score[1]-score[0] <= bet["nGoals"]
            elif bet["goalsCondition"]==EQ:
                return (score[1]-score[0])==bet["nGoals"]
            else:
                raise RuntimeError(LegErrMsg % (bet["goalsCondition"], Lose))
        elif bet["resultCondition"]==Draw:
            if bet["goalsCondition"]==GT:
                return (score[0]==score[1]) and (score[0] > bet["nGoals"])
            elif bet["goalsCondition"]==GTE:
                return (score[0]==score[1]) and (score[0] >= bet["nGoals"])
            elif bet["goalsCondition"]==LT:
                return (score[0]==score[1]) and (score[0] < bet["nGoals"])
            elif bet["goalsCondition"]==LTE:
                return (score[0]==score[1]) and (score[0] <= bet["nGoals"])
            elif bet["goalsCondition"]==EQ:
                return (score[0]==score[1]) and (score[0] == bet["nGoals"])
            else:
                raise RuntimeError(errmsg % (bet["goalsCondition"], Draw))
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
        if bet["legsCondition"]==GT:
            return bool_to_int(n > bet["nLegs"])
        elif bet["legsCondition"]==GTE:
            return bool_to_int(n >= bet["nLegs"])
        elif bet["legsCondition"]==LT:
            return bool_to_int(n < bet["nLegs"])
        elif bet["legsCondition"]==LTE:
            return bool_to_int(n <= bet["nLegs"])
        elif bet["legsCondition"]==EQ:
            return bool_to_int(n==bet["nLegs"])
        else:
            raise RuntimeError("%s is invalid legs condition" % bet["legsCondition"])
    return filterfn

# curl -X POST http://localhost:8080/app/exotic_accas/price -d @dev/exotic_acca_winner.json

class PriceHandler(webapp2.RequestHandler):
    
    def update_bet(self, bet):
        if bet["name"]==Winner:
            bet["resultCondition"]=Win
            bet["legsCondition"]=GTE
            bet["goalsCondition"]=GTE
        elif bet["name"]==Loser:
            bet["resultCondition"]=Lose
            bet["legsCondition"]=GTE
            bet["goalsCondition"]=GTE
        elif bet["name"]==Draws:
            bet["resultCondition"]=Draw
            bet["legsCondition"]=GTE
            bet["goalsCondition"]=GTE

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
    def post(self, bet, limit=0.005):
        matches=Blob.fetch("app/matches")
        self.update_bet(bet)
        prob=self.calc_probability(bet,
                                   matches,
                                   seed=Seed,
                                   paths=Paths)
        price=1/float(max(limit, prob))
        return {"price": price}
        
Routing=[('/app/exotic_accas/price', PriceHandler)]

app=webapp2.WSGIApplication(Routing)

