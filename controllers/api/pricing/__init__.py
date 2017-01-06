from controllers.api import *

import apis.yc_lite_api as yclite

All, EOS = "All", "EOS"

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
    return [{"name": team["name"]}
            for team in yclite.get_teams(leaguename)]

def fetch_results(leaguename):
    return [{"name": result["name"],
             "score": result["score"]}
            for result in yc_lite.get_results(leaguename)]

def fetch_fixtures(leaguename):
    return [{"name": fixture["name"],
             "date": fixture["date"],
             "probabilities": fixture["yc_probabilities"]}
            for fixture in [fixture.to_json()
                            for fixture in Event.find_all(leaguename)]]
    
def filter_expiry_date(fixtures, expirystr):
    if expirystr==EOS:
        return sorted([fixture["date"]
                       for fixture in fixtures])[-1]
    elif re.search("^\\d{4}\\-\\d{1,2}\\-\\d{1,2}$", expirystr):
        return datetime.datetime.strptime(expirystr, "%Y-%m-%d").date()
    else:
        raise RuntimeError("Couldn't parse '%s' as date" % expirystr)

def filter_teams(teams, teamnames):
    if All in teamnames:
        return teams
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



