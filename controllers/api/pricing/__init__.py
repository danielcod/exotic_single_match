from controllers.api import *

import apis.yc_lite_api as yclite

EOS = "EOS"

Today=datetime.date.today()

def fetch_teams(leaguename):
    teams=[{"league": leaguename,
            "name": team["name"]}
           for team in yclite.get_teams(leaguename)]
    if teams==[]:
        raise RuntimeError("No teams found")
    return teams

def fetch_results(leaguename):
    results=[{"league": leaguename,
              "name": result["name"],
              "score": result["score"]}
             for result in yclite.get_results(leaguename)]
    if results==[]:
        raise RuntimeError("No results found")
    return results

def fetch_fixtures(leaguename):
    fixtures=[{"league": leaguename,
               "name": fixture["name"],
               "date": fixture["date"],
               "probabilities": fixture["yc_probabilities"]}
              for fixture in [fixture.to_json()
                              for fixture in Event.find_all(leaguename)]]
    if fixtures==[]:
        raise RuntimeError("No fixtures found")
    return fixtures
    
def init_expiry_date(fixtures, expiry):
    if isinstance(expiry, datetime.date):
        return expiry
    elif expiry==EOS:
        return sorted([fixture["date"]
                       for fixture in fixtures])[-1]
    else:
        raise RuntimeError("Couldn't parse '%s' as date" % expiry)

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



