from models import *

import apis.yc_lite_api as yc_lite

from helpers.json_helpers import *

import datetime, re, yaml

Today=datetime.date.today()

def fetch_teams(leaguenames):
    if not isinstance(leaguenames, list):
        leaguenames=[leaguenames]
    teams=[]
    for leaguename in set(leaguenames):
        teams+=[{"league": leaguename,
                 "name": team["name"]}
                for team in yc_lite.get_teams(leaguename)]
    return teams

def fetch_results(leaguenames):
    if not isinstance(leaguenames, list):
        leaguenames=[leaguenames]
    results=[]
    for leaguename in set(leaguenames):
        results+=[{"league": leaguename,
                   "name": result["name"],
                   "score": result["score"]}
                  for result in yc_lite.get_results(leaguename)]
    return results

def fetch_fixtures(leaguenames):
    if not isinstance(leaguenames, list):
        leaguenames=[leaguenames]
    fixtures=[]
    for leaguename in set(leaguenames):
        fixtures+=[{"league": leaguename,
                    "name": fixture["name"],
                    "date": fixture["date"],
                    "probabilities": fixture["yc_probabilities"]}
                   for fixture in [fixture.to_json()
                                   for fixture in Fixture.find_all(leaguename)]]
    return fixtures


