from controllers.api import *

import apis.yc_lite_api as yclite

import quant.simulator as simulator

Paths, Seed = 1000, 13

All, EOS = "All", "EOS"

Winner, Top, Bottom = "Winner", "Top", "Bottom"

Today=datetime.date.today()

def parse_boolean(boolstr):
    return boolstr.lower() in ["true", "1"]
    
def parse_list(liststr):
    return liststr.split(",")

def parse_date(fixtures, expirystr):
    if expirystr==EOS:
        return sorted([fixture["date"]
                       for fixture in fixtures])[-1]
    elif re.search("^\\d{4}\\-\\d{1,2}\\-\\d{1,2}$", expirystr):
        return datetime.datetime.strptime(expirystr, "%Y-%m-%d").date()
    else:
        raise RuntimeError("Couldn't parse '%s' as date" % expirystr)

def parse_payoff(payoff):
    if payoff==Winner:
        return [0]
    elif re.search(Top+" \\d+", payoff):
        n=int(re.findall("\\d+", payoff)[0])
        return [i for i in range(n)]
    elif re.search(Bottom+" \\d+", payoff):
        n=int(re.findall("\\d+", payoff)[0])
        return [-(1+i) for i in range(n)]
    elif payoff==Bottom:
        return [-1]
    else:
        raise RuntimeError("Payoff not recognised")

def validate_teamnames(teams, teamnames):
    allteamnames=[team["name"]
                  for team in teams]
    errors=[teamname for teamname in teamnames
            if teamname not in allteamnames]
    if errors!=[]:
        raise RuntimeError("Invalid teams: %s" % ", ".join(errors))
    
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



