from tasks import *

import apis.yc_lite_api as yc_lite

Leagues=dict([(league["name"], league)
              for league in yaml.load(file("config/leagues.yaml").read())])

SDKwargs=yaml.load("""
realm: prod
username: admin
password: Hufton123
appengine: true
""")

