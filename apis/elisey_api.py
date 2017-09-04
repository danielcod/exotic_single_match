"""
- API which included latest price check
- currently not implemented due to missing datetime in Oddschecker results
"""

from apis import *

import datetime, yaml

Endpoint="http://iosport-exotics-api.appspot.com/_ah/api/main/v1"

ApiKey="AIzaSyAUCQTKkAEJ7CufQyr4yvrmxLaJRSOmsZg"

Bookmakers=yaml.load("""
- bet365
- Marathonbet
- Pinnacle
- WilliamHill
""")

Oddsportal, Oddschecker = "oddsportal", "oddschecker"

Results, Fixtures = "results", "fixtures"

Timeout=30 

"""
- rpc_get incorporates built- in 500 retry for simple handling of Elisey API timeouts
"""

def rpc_get(url, maxtries=5, wait=1):
    args={"method": "GET",
          "url": url,
          "headers": {"Accept": "application/json"},
          "deadline": Timeout}
    import time
    for i in range(maxtries):
        http=urlfetch.fetch(**args)
        if http.status_code==200:
            return json_loads(http.content)            
        elif http.status_code==400:
            raise RuntimeError(http.content)
        elif 5==http.status_code/100:
            time.sleep(wait)
        else:
            raise RuntimeError("Server returned HTTP %i" % http.status_code)
    raise RuntimeError("Max tries exceeded")

def get_leagues(season, key=ApiKey):
    resp=rpc_get(Endpoint+"/leagues?season=%s&key=%s" % (season, key))
    if "items" not in resp:
        return []
    leagues=resp["items"]
    return leagues
    
def get_teams(leaguename, season, key=ApiKey):
    resp=rpc_get(Endpoint+"/league_table?league=%s&season=%s&key=%s" % (leaguename, season, key))
    if "items" not in resp:
        return []
    teams=resp["items"]
    return teams

"""
- because Elisey has a habit of pushing garbage prices through the API which obviously affects pricing; not sufficient to run a validation report, you have to be aggressive and remove them at source
- then have to select latest for different sources which are supplied (oddschecker, oddsportal)
"""

def clean_prices(matches,
                 type,
                 attr="pre_event_1x2_prices",
                 default_timestamp=datetime.datetime(*[1970, 1, 1, 0, 0, 0])):
    def calc_overround(item):
        prices=[item["price_%s" % field]
                for field in ["1", "x", "2"]]
        probs=[1/float(price)
               for price in prices]
        return sum(probs)
    def filter_valid(match, items, type, cutoff):
        opitems=[item for item in items
                 if item["source"]==Oddsportal]
        valid=[]        
        for item in items:
            # ignore OC results prices unless there are no OP prices
            if (type==Results and
                item["source"]==Oddschecker and
                opitems!=[]):
                continue
            # ignore OC fixtures prices if timestamp < cutoff
            if (type==Fixtures and
                item["source"]==Oddschecker and
                match["kickoff"] < cutoff):
                continue
            # ignore if overround < 1
            if calc_overround(item) < 1:
                continue
            # add / valid
            valid.append(item)
        return valid
    def filter_latest(prices):
        groups={}
        for item in prices:
            if "datetime" not in item:
                item["datetime"]=default_timestamp
            groups.setdefault(item["bookmaker"], [])
            groups[item["bookmaker"]].append(item)
        return [sorted(groups[key],
                       key=lambda x: x["datetime"]).pop()
                for key in groups.keys()]
    now=datetime.datetime.utcnow()
    for match in matches:
        if attr not in match:
            continue
        match[attr]=filter_latest(filter_valid(match, match[attr], type, now))
        
def get_results(leaguename, season, bookmakers=Bookmakers, key=ApiKey):
    resp=rpc_get(Endpoint+"/results?league=%s&season=%s&bookmakers=%s&key=%s" % (leaguename, season, ",".join(bookmakers), key))
    if "items" not in resp:
        return []
    results=resp["items"]
    clean_prices(results, type=Results)
    return results

def get_remaining_fixtures(leaguename, season, bookmakers=Bookmakers, key=ApiKey):
    resp=rpc_get(Endpoint+"/remaining_fixtures?league=%s&season=%s&bookmakers=%s&key=%s" % (leaguename, season, ",".join(bookmakers), key))
    if "items" not in resp:
        return []
    fixtures=resp["items"]
    clean_prices(fixtures, type=Fixtures)
    return fixtures

if __name__=="__main__":
    try:
        from google.appengine.ext import testbed
        tb=testbed.Testbed()
        tb.activate()
        tb.init_urlfetch_stub()
        tb.init_memcache_stub()
        import sys
        if len(sys.argv) < 3:
            raise RuntimeError("Please enter league, season")
        leaguename, season = sys.argv[1:3]
        if not re.search("^\\D{3}\\.\\d$", leaguename):
            raise RuntimeError("League name is invalid")
        # leagues=get_leagues(season)
        # print "%i leagues" % len(leagues)
        teams=get_teams(leaguename, season)
        print "%i teams" % len(teams)
        results=sorted(get_results(leaguename, season),
                       key=lambda x: x["kickoff"])
        print "%i results" % len(results)
        print results[-1]        
        fixtures=sorted(get_remaining_fixtures(leaguename, season),
                        key=lambda x: x["kickoff"])
        print "%i fixtures" % len(fixtures)
        fixtures=[fixture for fixture in fixtures
                  if ("pre_event_1x2_prices" in fixture and
                      fixture["pre_event_1x2_prices"]!=[])]
        print "%i fixtures w/ prices" % len(fixtures)
        print fixtures[0]
    except RuntimeError, error:
        print "Error: %s" % str(error)
