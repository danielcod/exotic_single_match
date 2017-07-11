import time, urllib, yaml

Endpoints=yaml.load("""
dev: localhost:8080
prod: iosport-exotics-engine.appspot.com
""")

if __name__=="__main__":
    try:
        import sys, re
        if len(sys.argv) < 5:
            raise RuntimeError("Please enter realm, leaguename, pattern, wait")
        realm, leaguename, pattern, wait = sys.argv[1:5]
        if realm not in ["dev", "prod"]:
            raise RuntimeError("Realm is invalid")
        if leaguename.capitalize()!="All":
            if not re.search("^\\D{3}\\.\\d$", leaguename):
                raise RuntimeError("League is invalid")
        if not re.search("^\\d+", wait):
            raise RuntimeError("Wait must be an integer")
        wait=int(wait)
        tasks=yaml.load(file("./cron.yaml").read())["cron"]
        tasks=[task for task in tasks
               if re.search(pattern, task["url"])]
        if tasks==[]:
            raise RuntimeError("No tasks found")
        for i, task in enumerate(tasks):
            url="http://"+Endpoints[realm]+task["url"]
            if leaguename.capitalize()!="All":
                delimiter="&" if "?" in task["url"] else "?"
                url+=delimiter+"leagues="+leaguename
            print url
            try:
                print urllib.urlopen(url).read()
            except Exception, error:
                print "Error calling url"
            if i!=len(tasks)-1:
                time.sleep(wait)
    except RuntimeError, error:
        print "Error: %s" % str(error)
