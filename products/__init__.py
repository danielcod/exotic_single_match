from models import *

import apis.yc_lite_api as yc_lite

from helpers.json_helpers import *

import datetime, re

Today=datetime.date.today()

def filter_fixtures(fixtures, teams, expirydate, startdate=Today):
    teamnames=[team["name"]
               for team in teams]
    def filterfn(fixtures):
        matchteamnames=fixtures["name"].split(" vs ")
        return ((matchteamnames[0] in teamnames or
                 matchteamnames[1] in teamnames) and
                fixture["date"] > startdate and
                fixture["date"] <= expirydate)
    return [fixture for fixture in fixtures
            if filterfn(fixture)]



