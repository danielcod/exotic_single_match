import apis.yc_lite_api as yc_lite

from models import Fixture

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

def validate_quant(fn):
    def wrapped_fn(leaguenames):
        fixtures=fn(leaguenames)
        errors=[]
        for fixture in fixtures:
            if fixture["probabilities"] in ['', None, []]:
                errors.append("%s/%s" % (fixture["league"], fixture["name"]))
        if errors!=[]:
            raise RuntimeError("Following fixtures are missing yc probabilities: %s" % ", ".join(errors))
        return fixtures
    return wrapped_fn

@validate_quant
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

def add_id(fn):
    def wrapped_fn(self):
        resp=fn(self)
        if self.is_saved():
            resp["id"]=self.key().id()
        return resp
    return wrapped_fn
