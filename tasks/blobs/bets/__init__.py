from tasks.blobs import *

from models.bets.positions.mini_leagues import MiniLeagueBet
from models.bets.positions.season_match_bets import SeasonMatchBet
from models.bets.positions.single_team_outrights import SingleTeamOutrightBet

Products=yaml.load(file("config/products.yaml").read())

