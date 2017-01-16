from tasks import *

import apis.yc_lite_api as yc_lite

import datetime, random, time

Leagues=yaml.load(file("config/leagues.yaml").read())

Expiries=[{"label": "End of Jan",
           "value": datetime.date(2017, 1, 31)},
          {"label": "End of Feb",
           "value": datetime.date(2017, 2, 28)},
          {"label": "End of Mar",
           "value": datetime.date(2017, 3, 31)},
          {"label": "End of Apr",
           "value": datetime.date(2017, 4, 30)},
          {"label": "End of Season",
           "value": datetime.date(2017, 7, 1)}]

def random_seed():
    q=time.time()
    return int(q*1e10)-(int(q)*1e10)

          

