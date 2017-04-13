from tasks import *

import apis.yc_lite_api as yc_lite

Leagues=dict([(league["name"], league)
              for league in yaml.load(file("config/leagues.yaml").read())])

Products=yaml.load(file("config/products.yaml").read())

def end_of_season(today):
    if today.month < 7:
        return datetime.date(today.year, 6, 30)
    else:
        return datetime.date(today.year+1, 6, 30)

EndOfSeason=end_of_season(datetime.date.today())

