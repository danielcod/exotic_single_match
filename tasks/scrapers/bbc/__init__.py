from tasks.scrapers import *

import sport_data_client.scrapers.bbc_football as bbc

BBC="BBC"

Leagues=dict([(league["name"], league)
              for league in yaml.load(file("config/bbc.yaml").read())])

QueueName="bbc"
