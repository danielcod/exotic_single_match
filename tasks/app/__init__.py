from tasks import *

import apis.elisey_api as ebadi

Leagues=dict([(league["name"], league)
              for league in yaml.load(file("config/leagues.yaml").read())])




          

