from controllers.api import *

import apis.yc_lite_api as yclite

EOS = "EOS"

Today=datetime.date.today()

def parse_list(liststr):
    return liststr.split(",")

def validate_teamnames(teams, teamnames):
    allteamnames=[team["name"]
                  for team in teams]
    errors=[teamname for teamname in teamnames
            if teamname not in allteamnames]
    if errors!=[]:
        raise RuntimeError("Invalid teams: %s" % ", ".join(errors))

def fetch_teams(leaguename):
    teams=[{"name": team["name"]}
           for team in yclite.get_teams(leaguename)]
    if teams==[]:
        raise RuntimeError("No teams found")
    return teams

def fetch_results(leaguename):
    results=[{"name": result["name"],
              "score": result["score"]}
             for result in yclite.get_results(leaguename)]
    if results==[]:
        raise RuntimeError("No results found")
    return results

def fetch_fixtures(leaguename):
    fixtures=[{"name": fixture["name"],
               "date": fixture["date"],
               "probabilities": fixture["yc_probabilities"]}
              for fixture in [fixture.to_json()
                              for fixture in Event.find_all(leaguename)]]
    if fixtures==[]:
        raise RuntimeError("No fixtures found")
    return fixtures
    
def filter_expiry_date(fixtures, expirystr):
    if isinstance(expirystr, datetime.date):
        return expirystr
    elif expirystr==EOS:
        return sorted([fixture["date"]
                       for fixture in fixtures])[-1]
    else:
        raise RuntimeError("Couldn't parse '%s' as date" % expirystr)

def filter_teams(teams, teamnames):
    return [team for team in teams
            if team["name"] in teamnames]

def filter_fixtures(fixtures, teams, expirydate, startdate=Today):
    teamnames=[team["name"]
               for team in teams]
    def filterfn(result):
        matchteamnames=result["name"].split(" vs ")
        return (matchteamnames[0] in teamnames or
                matchteamnames[1] in teamnames)
    return [fixture for fixture in fixtures
            if (filterfn(fixture) and
                fixture["date"] > startdate and
                fixture["date"] <= expirydate)]



