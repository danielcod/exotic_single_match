from controllers.api import *

from products.positions.single_teams import SingleTeamsProduct
from products.positions.mini_leagues import MiniLeaguesProduct

Products={
    "single_teams": SingleTeamsProduct,
    "mini_leagues": MiniLeaguesProduct
}
