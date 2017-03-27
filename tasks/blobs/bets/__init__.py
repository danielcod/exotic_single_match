from tasks.blobs import *

from models.bets.positions.mini_leagues import MiniLeagueBet
from models.bets.positions.season_match_bets import SeasonMatchBet
from models.bets.positions.single_team_outrights import SingleTeamOutrightBet

Products=yaml.load(file("config/products.yaml").read())

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

