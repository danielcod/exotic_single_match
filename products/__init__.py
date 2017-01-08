from models import *

from helpers.json_helpers import *

import apis.yc_lite_api as yc_lite

import datetime, re

Today=datetime.date.today()

MaxProb, MinProb, MinPrice, MaxPrice = 0.99, 0.01, 1.001, 100

EOS="EOS"

def init_expiry_date(fixtures, expiry):
    if isinstance(expiry, datetime.date):
        return expiry
    elif expiry==EOS:
        return sorted([fixture["date"]
                       for fixture in fixtures])[-1]
    else:
        raise RuntimeError("Couldn't parse '%s' as date" % expiry)

def filter_selected_team(teams):
    for team in teams:
        if ("selected" in team and
            team["selected"]):
            return team
    raise RuntimeError("Selected team not found")            
    
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

def format_price(probability):
    if probability < MinProb:
        price=MaxPrice
    elif probability > MaxProb:
        price=MinPrice
    else:
        price=1/float(probability)
    if price < 2:
        return "%.3f" % price
    elif price < 5:
        return "%.2f" % price
    else:
        return "%.1f" % price



