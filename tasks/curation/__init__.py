from tasks import *

import apis.yc_lite_api as yc_lite

from models.bets.goals.exotic_accas import ExoticAccaBet
from models.bets.positions.mini_leagues import MiniLeagueBet
from models.bets.positions.season_match_bets import SeasonMatchBet
from models.bets.positions.single_team_outrights import SingleTeamOutrightBet

Leagues=dict([(league["name"], league)
              for league in yaml.load(file("config/leagues.yaml").read())])

Products=yaml.load(file("config/products.yaml").read())

def end_of_season(today):
    if today.month < 7:
        return datetime.date(today.year, 6, 30)
    else:
        return datetime.date(today.year+1, 6, 30)

EndOfSeason=end_of_season(datetime.date.today())

MaxProb, MinProb, MinPrice, MaxPrice = 0.99, 0.01, 1.001, 100

def format_price(probability):
    if probability < MinProb:
        price=MaxPrice
    elif probability > MaxProb:
        price=MinPrice
    else:
        price=1/float(probability)
    if price < 2:
        return "%.3f" % price
    elif price < 5:
        return "%.2f" % price
    else:
        return "%.1f" % price

