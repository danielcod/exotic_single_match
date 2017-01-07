from controllers.api import *

import apis.yc_lite_api as yclite

Today=datetime.date.today()

MaxProb, MinProb = 0.99, 0.01

def fetch_teams(leaguenames):
    if not isinstance(leaguenames, list):
        leaguenames=[leaguenames]
    teams=[]
    for leaguename in set(leaguenames):
        teams+=[{"league": leaguename,
                 "name": team["name"]}
                for team in yclite.get_teams(leaguename)]
    return teams

def fetch_results(leaguenames):
    if not isinstance(leaguenames, list):
        leaguenames=[leaguenames]
    results=[]
    for leaguename in set(leaguenames):
        results+=[{"league": leaguename,
                   "name": result["name"],
                   "score": result["score"]}
                  for result in yclite.get_results(leaguename)]
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
                                   for fixture in Event.find_all(leaguename)]]
    return fixtures
    
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

def format_price(probability, max_prob=MaxProb, min_prob=MinProb):
    if (probability < min_prob or
        probability > max_prob):
        return None
    price=1/float(probability)
    if price < 5:
        return "%.2f" % (1/probability)
    else:
        return "%.1f" % (1/probability)



