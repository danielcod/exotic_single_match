from models.bets.goals import *

class ExoticAccaBet(db.Model):

    teams=db.TextProperty()
    teams_condition=db.StringProperty()
    n_teams=db.IntegerProperty()
    result=db.StringProperty()
    goals_condition=db.StringProperty()
    n_goals=db.IntegerProperty()
    
    price=db.StringProperty()
    
    @classmethod
    def from_json(self, params):
        return ExoticAccaBet(teams=json_dumps(params["teams"]),
                             teams_condition=params["teams_condition"],
                             n_teams=params["n_teams"],
                             result=params["result"],
                             goals_condition=params["goals_condition"],
                             n_goals=params["n_goals"])

    @property
    def match_filterfn(self):
        errmsg="'%s' is invalid goals condition for match '%s' status"
        def filterfn(score):
            if self.result==Win:
                if self.goals_condition==GT:                
                    return score[0]-score[1] > self.n_goals
                elif self.goals_condition==LT:
                    return score[0]-score[1] < self.n_goals
                else:
                    raise RuntimeError(errmsg % (self.goals_condition, Win))
            elif self.result==Lose:
                if self.goals_condition==GT:
                    return score[1]-score[0] > self.n_goals
                elif self.goals_condition==LT:
                    return score[1]-score[0] < self.n_goals
                else:
                    raise RuntimeError(errmsg % (self.goals_condition, Lose))
            elif self.result==Draw:
                if self.goals_condition==EQ:
                    return score[0]==score[1]==self.n_goals
                else:
                    raise RuntimeError(errmsg % (self.goals_condition, Draw))
            else:
                raise RuntimeError("Bet result not found/recognised")
        return filterfn

    @property
    def bet_filterfn(self):
        matchfilterfn=self.match_filterfn
        def bool_to_int(value):
            return 1 if value else 0
        def filterfn(scores):
            outcomes=[matchfilterfn(scores[team["team"]])
                      for team in json.loads(self.teams)]
            n=len([outcome for outcome in outcomes
                   if outcome])
            if self.goals_condition==GT:
                return bool_to_int(n > self.n_goals)
            elif self.goals_condition==LT:
                return bool_to_int(n < self.n_goals)
            elif self.goals_condition==EQ:
                return bool_to_int(n==self.n_goals)
            else:
                raise RuntimeError("%s is invalid goals condition" % self.goals_condition)
        return filterfn

    """
    - remove format_matchname once matchteam blob includes match name
    """
    
    def calc_probability(self, paths=Paths, seed=Seed):
        def format_matchname(team):
            if team["home_away"]=="home":
                return "%s vs %s" % (team["team"], team["versus"])
            else:
                return "%s vs %s" % (team["versus"], team["team"])
        matches=[Fixture.get_by_key_name("%s/%s" % (team["league"],
                                                    format_matchname(team)))
                 for team in json.loads(self.teams)]
        samples=simulate_match_teams(matches, paths, seed)
        filterfn=self.bet_filterfn
        return sum([filterfn(scores)
                    for scores in samples])/float(paths)
    
    @add_id
    def to_json(self):
        return {"type": "exotic_acca",
                "teams": json_loads(self.teams),
                "teams_condition": self.teams_condition,
                "n_teams": self.n_teams,
                "result": self.result,
                "goals_condition": self.goals_condition,
                "n_goals": self.n_goals,
                "price": self.price,
                "description": self.description}
        
    @property
    def description(self):
        return {"selection": "[selection]",
                "market": "[market]",
                "group": {"label": "Exotic Acca",
                          "level": "blue"}}
    


