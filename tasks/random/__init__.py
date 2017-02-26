from tasks import *

import apis.yc_lite_api as yc_lite

from helpers.expiry_helpers import init_expiries

from helpers.price_helpers import format_price

import random

Leagues=yaml.load(file("config/leagues.yaml").read())

Expiries=init_expiries(cutoffmonth=4)

def random_seed():
    import time
    return int(1e10*time.time()) % 1e10


          

