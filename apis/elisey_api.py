from apis import *

import yaml

Endpoint="http://iosport-exotics-api.appspot.com/_ah/api/main/v1"

ApiKey="AIzaSyAUCQTKkAEJ7CufQyr4yvrmxLaJRSOmsZg"

Bookmakers=yaml.load("""
- bet365
- Pinnacle
- Marathonbet
- Unibet
""")

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

def unpack_items(fn):
    def wrapped_fn(*args, **kwargs):
        resp=fn(*args, **kwargs)
        if "items" not in resp:
            # raise RuntimeError("No items found")
            resp["items"]=[]
        return resp["items"]
    return wrapped_fn

@unpack_items
def get_leagues(season, key=ApiKey):
    return rpc_get(Endpoint+"/leagues?season=%s&key=%s" % (season, key))

@unpack_items
def get_teams(leaguename, season, key=ApiKey):
    return rpc_get(Endpoint+"/league_table?league=%s&season=%s&key=%s" % (leaguename, season, key))

@unpack_items
def get_results(leaguename, season, bookmakers=Bookmakers, key=ApiKey):
    return rpc_get(Endpoint+"/results?league=%s&season=%s&bookmakers=%s&key=%s" % (leaguename, season, ",".join(bookmakers), key))

@unpack_items
def get_remaining_fixtures(leaguename, season, bookmakers=Bookmakers, key=ApiKey):
    return rpc_get(Endpoint+"/remaining_fixtures?league=%s&season=%s&bookmakers=%s&key=%s" % (leaguename, season, ",".join(bookmakers), key))

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
        leagues=get_leagues(season)
        print "%i leagues" % len(leagues)
        teams=get_teams(leaguename, season)
        print "%i teams" % len(teams)
        results=get_results(leaguename, season)
        print "%i results" % len(results)
        remfixtures=get_remaining_fixtures(leaguename, season)
        print "%i rem fixtures" % len(remfixtures)
    except RuntimeError, error:
        print "Error: %s" % str(error)
