import urllib, yaml

Endpoints=yaml.load("""
dev: localhost:8080
prod: iosport-exotics-engine.appspot.com
""")

if __name__=="__main__":
    try:
        import sys
        if len(sys.argv) < 2:
            raise RuntimeError("Please enter realm")
        realm=sys.argv[1]
        if realm not in Endpoints:
            raise RuntimeError("Realm is invalid")
        url="http://%s/admin/memcache/flush" % Endpoints[realm]
        try:
            print urllib.urlopen(url).read()
        except Exception, error:
            print "Error calling url"
    except RuntimeError, error:
        print "Error: %s" % str(error)
