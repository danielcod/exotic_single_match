import httplib, yaml

Endpoints=yaml.load("""
prod: iosport-exotics-engine.appspot.com:80
dev: localhost:8080
""")

Paths=yaml.load("""
- /tasks/products/trash/season_match_bets
- /tasks/products/trash/single_team_outrights
""")

def post_task(realm, path):
    http=httplib.HTTPConnection(Endpoints[realm])
    http.request('GET', path, headers={})
    resp=http.getresponse()
    if resp.status==400:
        raise RuntimeError(resp.read())
    if resp.status!=200:
        raise RuntimeError("Server returned HTTP %i" % resp.status)
    return resp.read()

if __name__=="__main__":
    try:
        import re, sys, time
        if len(sys.argv) < 3:
            raise RuntimeError("Please enter realm, wait")
        realm, wait = sys.argv[1:3]
        if realm not in Endpoints:
            raise RuntimeError("Realm not recognised")
        if not re.search("^\\d+$", wait):
            raise RuntimeError("Wait is invalid")
        wait=int(wait)
        for path in Paths:
            print path
            print post_task(realm, path)
            time.sleep(wait)
    except RuntimeError, error:
        print "Error: %s" % str(error)
        
