from apis import *

# Endpoint="http://localhost:8080"

Endpoint="http://iosport-yc-lite2.appspot.com"

DefaultRatingRiskLimit=0.01
DefaultMatchRiskLimit=0.01
DefaultValuePricesLimit=10

MemcacheAge=60*10

def fetch_memcache(memkey, url, debug):
    resp=memcache.get(memkey)
    if resp not in ['', None]:
        if debug:
            print "Serving %s from memcache" % memkey
        return json_loads(resp)
    if debug:
        print "Fetching %s" % url
    resp=rpc_get(url)
    if debug:
        print "Saving %s to memcache" % memkey
    memcache.add(memkey, json_dumps(resp), MemcacheAge)
    return resp    

def get_leagues(debug=False):
    memkey="leagues"
    url=Endpoint+"/api/leagues"
    return fetch_memcache(memkey, url, debug)

def get_teams(leaguename, debug=False):
    memkey="%s/teams" % leaguename
    url=Endpoint+"/api/teams?league=%s" % urllib.quote(leaguename)
    return fetch_memcache(memkey, url, debug)

def get_upcoming_matches(leaguename, debug=False):
    memkey="%s/upcoming_matches" % leaguename
    url=Endpoint+"/api/upcoming_matches?league=%s" % urllib.quote(leaguename)
    return fetch_memcache(memkey, url, debug)

def get_remaining_fixtures(leaguename, debug=False):
    memkey="%s/remaining_fixtures" % leaguename
    url=Endpoint+"/api/remaining_fixtures?league=%s" % urllib.quote(leaguename)
    return fetch_memcache(memkey, url, debug)

def get_results(leaguename, debug=False):
    memkey="%s/results" % leaguename
    url=Endpoint+"/api/results?league=%s" % urllib.quote(leaguename)
    return fetch_memcache(memkey, url, debug)

if __name__=="__main__":
    try:
        from google.appengine.ext import testbed
        tb=testbed.Testbed()
        tb.activate()
        tb.init_urlfetch_stub()
        tb.init_memcache_stub()
        import sys
        if len(sys.argv) < 2:
            raise RuntimeError("Please enter leaguename, teamname")
        leaguename, teamname = sys.argv[1:3]
        if not re.search("^\\D{3}\\.\\d$", leaguename):
            raise RuntimeError("League name is invalid")
        print "%i leagues" % len(get_leagues(debug=True))
        print "%i teams" % len(get_teams(leaguename))
        print "%i upcoming matches" % len(get_upcoming_matches(leaguename))
        # print "%i remaining fixtures" % len(get_remaining_fixtures(leaguename))
        remfixtures=get_remaining_fixtures(leaguename)
        print "%i remaining fixtures" % len(remfixtures)
        print remfixtures[0]
        print "%i results" % len(get_results(leaguename))
    except RuntimeError, error:
        print "Error: %s" % str(error)
