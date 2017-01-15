import httplib, random, re, urllib

from helpers.json_helpers import *

SingleTeams="single_teams"

Endpoint="localhost:8080"

MinProb, MaxProb = 0.25, 0.75

def get_json(path):
    http=httplib.HTTPConnection(Endpoint)
    headers={"Content-Type": "application/json"}
    http.request('GET', path, headers=headers)
    resp=http.getresponse()
    if resp.status==400:
        raise RuntimeError(resp.read())
    if resp.status!=200:
        raise RuntimeError("Server returned HTTP %i" % resp.status)
    return json_loads(resp.read())

def post_json(path, struct):
    http=httplib.HTTPConnection(Endpoint)
    payload=json_dumps(struct)
    headers={"Content-Type": "application/json",
             "Content-Length": str(len(payload))}
    http.request('POST', path, payload, headers=headers)
    resp=http.getresponse()
    if resp.status==400:
        raise RuntimeError(resp.read())
    if resp.status!=200:
        raise RuntimeError("Server returned HTTP %i" % resp.status)
    return json_loads(resp.read())

def fetch_leagues():
    return [{"name": league["value"]}
            for league in get_json("/api/leagues")]

def fetch_teams(leaguename):
    return [{"name": team["value"]}
            for team in get_json("/api/teams?league="+leaguename)]

def fetch_payoffs(leaguename, teamname, productname=SingleTeams):
    return [{"name": payoff["value"],
             "probability": payoff["probability"]}
            for payoff in get_json("/api/products/payoffs?product=%s&league=%s&team=%s" % (productname, leaguename, urllib.quote(teamname)))]

def fetch_expiries():
    """
    return [{"name": expiry["value"]}
            for expiry in 
    """
    return get_json("/api/expiries")
             
if __name__=="__main__":
    try:
        import sys
        if len(sys.argv) < 2:
            raise RuntimeError("Please enter n")
        n=sys.argv[1]
        if not re.search("^\\d+$", n):
            raise RuntimeError("n is invalid")
        n=int(n)
        expiries=fetch_expiries()
        leagues=fetch_leagues()
        allteams={}
        for i in range(n):
            print "-------------------------"
            print "bet: %i/%i" % (1+i, n)
            j=int(len(leagues)*random.random())
            leaguename=leagues[j]["name"]
            print "league: %s" % leaguename
            if leaguename not in allteams:
                allteams[leaguename]=fetch_teams(leaguename)
            teams=allteams[leaguename]
            j=int(len(teams)*random.random())
            teamname=teams[j]["name"]
            print "team: %s" % teamname
            payoffs=[payoff
                     for payoff in fetch_payoffs(leaguename, teamname)
                     if (payoff["probability"] > MinProb and
                         payoff["probability"] < MaxProb )]
            j=int(len(payoffs)*random.random())
            payoffname=payoffs[j]["name"]
            print "payoff: %s" % payoffname
            j=int(len(expiries)*random.random())
            expiryvalue=expiries[j]["value"]
            print "expiry: %s" % expiryvalue
            struct={"product": "single_teams",
                    "query": {"league": leaguename,
                              "team": teamname,
                              "payoff": payoffname,
                              "expiry": expiryvalue}}
            resp=post_json("/api/products/pricing", struct)
            price=resp["decimal_price"]
            print "price: %s" % price
    except RuntimeError, error:
        print "Error: %s" % str(error)
