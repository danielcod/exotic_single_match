from quant.multi_match import *

import unittest

def round_up(value):
    return value if int(value)==value else int(value+1)

def round_down(value):
    return int(value)
    
class Bet:

    def __init__(self, bet):
        if bet["n_goals"]:
            bet["n_goals"]=round_up(bet["n_goals"]) # NB
        self.bet=bet

    @property
    def has_selection(self):
        return True

    @property
    def description_matches(self):
        return ", ".join([leg["match"]
                          for leg in self.bet["legs"]])
    
    @property
    def description_selections(self):
        tokens=[]
        for leg in self.bet["legs"]:
            teamnames=leg["match"].split(" vs ")
            i, j = self.init_indexes(leg)
            tokens.append("%s (vs %s)" % (teamnames[i],
                                          teamnames[j]))
        return ", ".join(tokens)

    def init_indexes(self, leg):
        teamnames=leg["match"].split(" vs ")
        i=teamnames.index(leg["selection"])
        return (i, 1-i)    
    
class Winners(Bet):

    def __init__(self, bet):
        Bet.__init__(self, bet)
    
    @property
    def description(self):
        tokens=[]
        tokens.append("At least %i out of" % self.bet["n_legs"])
        tokens.append(self.description_selections)
        tokens.append("to win")
        tokens.append("by at least %i goal(s)" % self.bet["n_goals"])
        return " ".join(tokens)

    @property
    def short_description(self):
        tokens=[]
        tokens.append("At least %i out of %i selections" % (self.bet["n_legs"],
                                                            len(self.bet["legs"])))
        tokens.append("to win")
        tokens.append("by at least %i goal(s)" % self.bet["n_goals"])
        return " ".join(tokens)
    
    def sim_payoff(self, leg, score):
        i, j = self.init_indexes(leg)
        return score[i]-score[j] >= self.bet["n_goals"]
    
class Losers(Bet):

    def __init__(self, bet):
        Bet.__init__(self, bet)

    @property
    def description(self):
        tokens=[]
        tokens.append("At least %i out of" % self.bet["n_legs"])
        tokens.append(self.description_selections)
        tokens.append("to lose")
        tokens.append("by at least %i goal(s)" % self.bet["n_goals"])
        return " ".join(tokens)

    @property
    def short_description(self):
        tokens=[]
        tokens.append("At least %i out of %i selections" % (self.bet["n_legs"],
                                                            len(self.bet["legs"])))
        tokens.append("to lose")
        tokens.append("by at least %i goal(s)" % self.bet["n_goals"])
        return " ".join(tokens)

    
    def sim_payoff(self, leg, score):
        i, j = self.init_indexes(leg)
        return score[j]-score[i] >= self.bet["n_goals"]

class Draws(Bet):

    def __init__(self, bet):
        Bet.__init__(self, bet)

    @property
    def description(self):
        tokens=[]
        tokens.append("At least %i out of" % self.bet["n_legs"])
        tokens.append(self.description_matches)
        tokens.append("to draw")
        tokens.append("with at least %i goal(s)" % self.bet["n_goals"])
        return " ".join(tokens)

    @property
    def short_description(self):
        tokens=[]
        tokens.append("At least %i out of %i matches" % (self.bet["n_legs"],
                                                         len(self.bet["legs"])))
        tokens.append("to draw")
        tokens.append("with at least %i goal(s)" % self.bet["n_goals"])
        return " ".join(tokens)
    
    @property
    def has_selection(self):
        return False
        
    def sim_payoff(self, leg, score):
        return (score[0]==score[1] and
                score[0] >= self.bet["n_goals"])

class Overs(Bet):

    def __init__(self, bet):
        Bet.__init__(self, bet)

    @property
    def description(self):
        tokens=[]
        tokens.append("At least %i goal(s)" % self.bet["n_goals"])
        tokens.append("in at least %i out of" % self.bet["n_legs"])
        tokens.append(self.description_matches)
        return " ".join(tokens)

    @property
    def short_description(self):
        tokens=[]
        tokens.append("At least %i goal(s)" % self.bet["n_goals"])
        tokens.append("in at least %i out of %i matches" % (self.bet["n_legs"],
                                                            len(self.bet["legs"])))
        return " ".join(tokens)
    
    @property
    def has_selection(self):
        return False
        
    def sim_payoff(self, leg, score):
        return score[0]+score[1] >= self.bet["n_goals"]

class Unders(Bet):

    """
    NB custom constructor for 'under' bet
    """
    
    def __init__(self, bet):
        bet["n_goals"]=round_down(bet["n_goals"]) # NB
        self.bet=bet

    @property
    def description(self):
        tokens=[]
        tokens.append("Less than %i goal(s)" % self.bet["n_goals"])
        tokens.append("in at least %i out of" % self.bet["n_legs"])
        tokens.append(self.description_matches)
        return " ".join(tokens)

    @property
    def short_description(self):
        tokens=[]
        tokens.append("Less than %i goal(s)" % self.bet["n_goals"])
        tokens.append("in at least %i out of %i matches" % (self.bet["n_legs"],
                                                            len(self.bet["legs"])))
        return " ".join(tokens)
    
    @property
    def has_selection(self):
        return False
        
    def sim_payoff(self, leg, score):
        return score[0]+score[1] < self.bet["n_goals"]

class BTTS(Bet):

    def __init__(self, bet):
        Bet.__init__(self, bet)

    @property
    def description(self):
        tokens=[]
        tokens.append("Both teams to score")
        tokens.append("in at least %i out of" % self.bet["n_legs"])
        tokens.append(self.description_matches)
        return " ".join(tokens)

    @property
    def short_description(self):
        tokens=[]
        tokens.append("Both teams to score")
        tokens.append("in at least %i out of %i matches" % (self.bet["n_legs"],
                                                            len(self.bet["legs"])))
        return " ".join(tokens)
    
    @property
    def has_selection(self):
        return False
        
    def sim_payoff(self, leg, score):
        return score[0] > 0 and score[1] > 0

class Scored(Bet):

    def __init__(self, bet):
        Bet.__init__(self, bet)

    @property
    def description(self):
        tokens=[]
        tokens.append("At least %i out of" % self.bet["n_legs"])
        tokens.append(self.description_selections)
        tokens.append("to score at least %i goal(s)" % self.bet["n_goals"])
        return " ".join(tokens)

    @property
    def short_description(self):
        tokens=[]
        tokens.append("At least %i out of %i selections" % (self.bet["n_legs"],
                                                            len(self.bet["legs"])))
        tokens.append("to score at least %i goal(s)" % self.bet["n_goals"])
        return " ".join(tokens)
    
    def sim_payoff(self, leg, score):
        i, _ = self.init_indexes(leg)
        return score[i] >= self.bet["n_goals"]

class Conceded(Bet):

    def __init__(self, bet):
        Bet.__init__(self, bet)

    @property
    def description(self):
        tokens=[]
        tokens.append("At least %i out of" % self.bet["n_legs"])
        tokens.append(self.description_selections)
        tokens.append("to concede at least %i goal(s)" % self.bet["n_goals"])
        return " ".join(tokens)

    @property
    def short_description(self):
        tokens=[]
        tokens.append("At least %i out of %i selections" % (self.bet["n_legs"],
                                                            len(self.bet["legs"])))
        tokens.append("to concede at least %i goal(s)" % self.bet["n_goals"])
        return " ".join(tokens)

    def sim_payoff(self, leg, score):
        _, j = self.init_indexes(leg)
        return score[j] >= self.bet["n_goals"]

class WinnersOvers(Bet):

    def __init__(self, bet):
        Bet.__init__(self, bet)

    @property
    def description(self):
        tokens=[]
        tokens.append("At least %i out of" % self.bet["n_legs"])
        tokens.append(self.description_selections)
        tokens.append("to win")
        tokens.append("and at least %i goal(s) to be scored in those matches" % self.bet["n_goals"])
        return " ".join(tokens)

    @property
    def short_description(self):
        tokens=[]
        tokens.append("At least %i out of %i selections" % (self.bet["n_legs"],
                                                            len(self.bet["legs"])))
        tokens.append("to win")
        tokens.append("and at least %i goal(s) to be scored in those matches" % self.bet["n_goals"])
        return " ".join(tokens)
    
    def sim_payoff(self, leg, score):
        i, j = self.init_indexes(leg)
        return (score[i] > score[j] and
                score[0]+score[1] >= self.bet["n_goals"])

class WinnersBTTS(Bet):

    def __init__(self, bet):
        Bet.__init__(self, bet)

    @property
    def description(self):
        tokens=[]
        tokens.append("At least %i out of" % self.bet["n_legs"])
        tokens.append(self.description_selections)
        tokens.append("to win")
        tokens.append("by at least %i goal(s)" % self.bet["n_goals"])
        tokens.append("and both teams to score")
        return " ".join(tokens)

    @property
    def short_description(self):
        tokens=[]
        tokens.append("At least %i out of %i selections" % (self.bet["n_legs"],
                                                            len(self.bet["legs"])))
        tokens.append("to win")
        tokens.append("by at least %i goal(s)" % self.bet["n_goals"])
        tokens.append("and both teams to score")
        return " ".join(tokens)
    
    def sim_payoff(self, leg, score):
        i, j = self.init_indexes(leg)
        return (score[i]-score[j] >= self.bet["n_goals"] and
                score[i] > 0 and
                score[j] > 0)

class OversBTTS(Bet):

    def __init__(self, bet):
        self.bet=bet

    @property
    def description(self):
        tokens=[]
        tokens.append("At least %i goal(s)" % self.bet["n_goals"])
        tokens.append("in at least %i out of" % self.bet["n_legs"])
        tokens.append(self.description_matches)
        tokens.append("and both teams to score")
        return " ".join(tokens)

    @property
    def short_description(self):
        tokens=[]
        tokens.append("At least %i goal(s)" % self.bet["n_goals"])
        tokens.append("in at least %i out of %i matches" % (self.bet["n_legs"],
                                                            len(self.bet["legs"])))
        tokens.append("and both teams to score")
        return " ".join(tokens)
    
    @property
    def has_selection(self):
        return False
        
    def sim_payoff(self, leg, score):
        return (score[0]+score[1] >= self.bet["n_goals"] and
                score[0] > 0 and
                score[1] > 0)

class RoundingTest(unittest.TestCase):

    def test_round_up(self):
        for x, y in [(1, 1),
                     (2, 1.1)]:
            self.assertEqual(x, round_up(y))

    def test_round_down(self):
        for x, y in [(1, 1),
                     (1, 1.9)]:
            self.assertEqual(x, round_down(y))
            
class PayoffTest(unittest.TestCase):

    def test_payoff(self):
        import os
        for productname in Products:
            filename="config/tests/multi_match/%s.yaml" % productname
            if not os.path.exists(filename):
                continue
            # print productname
            for sample in yaml.load(file(filename).read()):
                betclass=eval(Products[productname])
                bet=betclass(sample["bet"])
                self.assertEqual(sample["outcome"],
                                 bet.sim_payoff(sample["leg"], sample["score"]))

if __name__=="__main__":
    unittest.main()
