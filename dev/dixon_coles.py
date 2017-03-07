"""
- need to replace existing Oddschecker code with new SDC stuff
- solve with respect to 1x2 only; can use rho for over/under matching later
"""

"""
http://localhost:8888/notebooks/notebooks/sportshacker/dixon_coles_adjustment.ipynb
"""

import pandas as pd
import numpy as np
import lxml.html, math, re, urllib

HomeWin, AwayWin, Draw = "home_win", "away_win", "draw"

Over, Under = "over", "under"

EPLUrl="http://www.oddschecker.com/football/english/premier-league/%s/%s"

def poisson(l, x):
    return (l**x)*math.exp(-l)/math.factorial(x)

def correct_score_grid(lx, ly, rho, n):
    return [[poisson(lx, i)*poisson(ly, j)
             for j in range(n)]
            for i in range(n)]

def correct_score_grid(lx, ly, rho, n):
    def DC_factor(i, j):
        if i==0 and j==0:
            return 1-lx*ly*rho
        elif i==0 and j==1:
            return 1+lx*rho
        elif i==1 and j==0:
            return 1+ly*rho
        elif i==1 and j==1:
            return 1-rho
        else:
            return 1
    return [[poisson(lx, i)*poisson(ly, j)*DC_factor(i, j)
             for j in range(n)]
            for i in range(n)]

"""
http://stackoverflow.com/questions/4265546/python-round-to-nearest-05
"""

def round_to(n, precision):
    correction = 0.5 if n >= 0 else -0.5
    return int(n/precision+correction)*precision

def nearest_half(n):
    return round_to(n, precision=0.5)

class CSGrid(list):

    def __init__(self, data):
        list.__init__(self, data)

    def sum(self, filterfn):
        return sum([self[i][j]                    
                    for i in range(len(self))
                    for j in range(len(self))
                    if filterfn(i, j)])
                    
    def match_odds(self, selection):
        filterfns={HomeWin: lambda i, j: i > j,
                   AwayWin: lambda i, j: i < j,
                   Draw: lambda i, j: i==j}
        return self.sum(filterfns[selection])
    
    def correct_score(self, score):
        i, j = score
        return self[i][j]
    
    # asian handicaps
               
    def nearest_AH_strikes(self, strike):
        stk=nearest_half(strike)
        if stk < strike:
            return (stk, stk+0.5)
        elif stk > strike:
            return (stk-0.5, stk)
        else:
            return (stk, stk)
        
    def home_asian_handicap(self, strike):
        def asian_handicap(strike):
            nfilterfn=lambda i, j: i+strike > j
            dfilterfn=lambda i, j: i+strike != j
            return self.sum(nfilterfn)/float(self.sum(dfilterfn))
        upstrike, downstrike = self.nearest_AH_strikes(strike)
        # print (strike, (upstrike, downstrike))
        return (asian_handicap(upstrike)+
                asian_handicap(downstrike))/float(2)
            
    def away_asian_handicap(self, strike):
        def asian_handicap(strike):
            nfilterfn=lambda i, j: j+strike > i
            dfilterfn=lambda i, j: j+strike != i
            return self.sum(nfilterfn)/float(self.sum(dfilterfn))
        upstrike, downstrike = self.nearest_AH_strikes(strike)
        # print (strike, (upstrike, downstrike))
        return (asian_handicap(upstrike)+
                asian_handicap(downstrike))/float(2)
    
    # over / under goals
            
    def over_goals(self, strike):        
        filterfn=lambda i, j: i+j > strike
        return self.sum(filterfn)
    
    def under_goals(self, strike):
        filterfn=lambda i, j: i+j < strike
        return self.sum(filterfn)

def solve_grid_params(match_odds_probs, over_under_probs, over_under_strike, n):
    def errfn(q):
        lx, ly, rho = q
        grid=CSGrid(correct_score_grid(lx, ly, rho, n))
        err=[]
        err+=[(grid.match_odds(key)-value)**2
              for key, value in match_odds_probs.items()]
        err+=[(getattr(grid, "%s_goals" % key)(over_under_strike)-value)**2
              for key, value in over_under_probs.items()]
        return sum(err)
    from scipy import optimize
    return optimize.fmin(errfn, (1, 1, 0))

def parse_fractional_quote(text):
    tokens=[int(tok) for tok in text.split("/")]
    if len(tokens)==1:
        tokens.append(1)
    return 100/(1+tokens[0]/float(tokens[1]))

def _get_prices(url):
    doc=lxml.html.fromstring(urllib.urlopen(url).read())
    table=doc.xpath("//table[@class='eventTable ']")[0]
    rows=table.xpath("tbody/tr")
    """
    http://stackoverflow.com/questions/4624062/get-all-text-inside-a-tag-in-lxml
    """
    def stringify_children(node):
        from lxml.etree import tostring
        from itertools import chain
        parts = ([node.text] +
                 list(chain(*([c.text, tostring(c), c.tail] for c in node.getchildren()))) +
                 [node.tail])
        return ''.join(filter(None, parts))
    def clean_text(text):
        return " ".join([tok for tok in re.split("\\s", text)
                         if tok!=''])
    def filter_tail_text(text):
        tokens=[tok for tok in re.split("\\s", text)
                if tok!='']
        return tokens[-1]
    items={}
    for row in rows:
        # oddscheckerid=row.attrib["data-participant-id"]
        name=None
        for td in row.xpath("td"):
            if not "id" in td.attrib:
                continue
            suffix=td.attrib["id"].split("_")[-1]
            if suffix=="name":
                name=clean_text(td.text)
                continue
            if not re.search("^\\D{2}$", suffix):
                continue
            if suffix=="SI":
                continue
            if td.text==None:
                continue
            items.setdefault(name, {"name": name,
                                    "bookmaker": None,
                                    "price": 1e10})
            price=parse_fractional_quote(filter_tail_text(stringify_children(td)))
            if price < items[name]["price"]:
                items[name]["price"]=price
                items[name]["bookmaker"]=suffix
    return sorted(items.values(),
                  key=lambda x: -x["price"])

def format_match_odds(teams, price):
    Config={teams[0]: {"selection": HomeWin,
                       "label": "HW"},
            teams[1]: {"selection": AwayWin,
                       "label": "AW"},
            "Draw": {"selection": Draw,
                     "label": "D"}}
    return {"group": "Match Odds",
            "selection": Config[price["name"]]["label"],
            "fn": "match_odds",
            "args": {"selection": Config[price["name"]]["selection"]},
            "market_price": price["price"]}

def format_correct_score(teams, price):
    def filter_score(text):
        tokens=[int(tok) 
               for tok in re.findall("\\d+\\-\\d+", text)[0].split("-")]
        if teams[1] in text:
            tokens.reverse()
        return tuple(tokens) 
    score=filter_score(price["name"])
    return {"group": "Correct Score",
            "selection": "%i-%i" % score,                              
            "fn": "correct_score",
            "args": {"score": score},
            "market_price": price["price"]}
    
def format_total_goals(strike, price):
    return {"group": "%s Goals" % price["name"],
            "selection": "%.1f" % strike,
            "fn": "%s_goals" % price["name"].lower(),
            "args": {"strike": strike},
            "market_price": price["price"]}
    
def format_asian_handicap(teams, price):
    homeaway="home" if teams[0] in price["name"] else "away"
    strikestr=price["name"].split(" ")[-1]
    return {"group": "AH %s" % homeaway.capitalize(),
            "selection": strikestr,
            "fn": "%s_asian_handicap" % homeaway,
            "args": {"strike": float(strikestr)},
            "market_price": price["price"]}
        
def get_prices(teams, urlpattern=EPLUrl, wait=0.5):
    import time
    def fetch(marketname):
        url=urlpattern % (" v ".join(teams), marketname)
        url=url.lower().replace(" ", "-")
        # print url
        prices=_get_prices(url)
        time.sleep(wait)
        return prices
    prices=[]
    # match odds
    prices+=[format_match_odds(teams, price)
             for price in fetch("Winner")]
    # correct score
    prices+=[format_correct_score(teams, price)
             for price in fetch("Correct Score")
             if "Any Other" not in price["name"]]
    # total goals
    for i in range(1, 6):
        strike=i+0.5
        prices+=[format_total_goals(strike, price)
                for price in fetch("Over Under %.1f" % strike)]
    # asian handicaps
    prices+=[format_asian_handicap(teams, price)
             for price in fetch("Asian Handicap")]
    return prices

def add_model_prices(prices, over_under_strike=2.5, n=15):
    def normalise_prices(prices):
        overround=sum(prices.values())
        for key in prices.keys():
            prices[key]=prices[key]/float(overround) 
    match_odds_prices=dict([(price["args"]["selection"], 
                             price["market_price"])
                            for price in prices
                            if price["fn"]=="match_odds"])
    normalise_prices(match_odds_prices)
    over_under_prices=dict([(price["fn"].split("_")[0],
                             price["market_price"])
                            for price in prices
                            if (price["fn"] in ["over_goals", "under_goals"] and  
                                price["args"]["strike"]==over_under_strike)])
    normalise_prices(over_under_prices)
    lx, ly, rho = solve_grid_params(match_odds_prices, 
                                    over_under_prices, 
                                    over_under_strike, 
                                    n)
    print 
    print "lx: %.5f" % lx
    print "ly: %.5f" % ly
    print "rho: %.5f" % rho
    grid=CSGrid(correct_score_grid(lx, ly, rho, n))
    for price in prices:
        price["model_price"]=100*getattr(grid, price["fn"])(**price["args"])
        price["diff"]=price["model_price"]-price["market_price"]

if __name__=="__main__":
    print (np.array(correct_score_grid(2.5, 1.5, 0.1, 5))-
           np.array(correct_score_grid(2.5, 1.5, 0.0, 5)))
    SamplePrices=get_prices(("Hull", "Swansea"))
    print "%i prices found" % len(SamplePrices)
    print
    add_model_prices(SamplePrices)
    SortFn=lambda x: "%s/%s" % (x["group"], x["selection"])
    Columns=["group", "selection", "model_price", "market_price", "diff"]
    print pd.DataFrame(sorted([price for price in SamplePrices
                               if price["group"] in ["Match Odds"]],
                              key=SortFn),
                       columns=Columns)
    print pd.DataFrame(sorted([price for price in SamplePrices
                               if price["group"] in ["Over Goals", "Under Goals"]],
                              key=SortFn),
                       columns=Columns)



