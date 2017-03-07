from tasks.products import *

from helpers.expiry_helpers import init_expiries

from helpers.price_helpers import format_price

import random

Expiries=init_expiries()

def random_seed():
    import time
    return int(1e10*time.time()) % 1e10


          

