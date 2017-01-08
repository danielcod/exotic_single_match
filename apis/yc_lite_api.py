from apis import *

# Endpoint="http://localhost:8080"

Endpoint="http://iosport-yc-lite2.appspot.com"

DefaultRatingRiskLimit=0.01
DefaultMatchRiskLimit=0.01
DefaultValuePricesLimit=10

MemcacheAge=60*10

def fetch_memcache(memkey, url):
    resp=memcache.get(memkey)
    if resp not in ['', None]:
        return json_loads(resp)
    resp=rpc_get(url)
    memcache.add(memkey, json_dumps(resp), MemcacheAge)
    return resp    

def get_leagues():
    memkey="leagues"
    url=Endpoint+"/api/leagues"
    return fetch_memcache(memkey, url)

def get_teams(leaguename):
    memkey="%s/teams" % leaguename
    url=Endpoint+"/api/teams?league=%s" % urllib.quote(leaguename)
    return fetch_memcache(memkey, url)

def get_remaining_fixtures(leaguename):
    memkey="%s/remaining_fixtures" % leaguename
    url=Endpoint+"/api/remaining_fixtures?league=%s" % urllib.quote(leaguename)
    return fetch_memcache(memkey, url)

def get_results(leaguename):
    memkey="%s/results" % leaguename
    url=Endpoint+"/api/results?league=%s" % urllib.quote(leaguename)
    return fetch_memcache(memkey, url)

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
        print "%i leagues" % len(get_leagues())
        print "%i teams" % len(get_teams(leaguename))
        print "%i remaining fixtures" % len(get_remaining_fixtures(leaguename))
        print "%i results" % len(get_results(leaguename))
    except RuntimeError, error:
        print "Error: %s" % str(error)
