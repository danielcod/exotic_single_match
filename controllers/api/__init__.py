from controllers import *

Leagues=yaml.load(file("config/leagues.yaml").read())

Deps = yaml.load(file("config/app_deps.yaml").read())

CookieName="ioSport"

def filter_userid(fn):
    def wrapped_fn(self, *args, **kwargs):
        try:
            cookiestr=self.request.headers["Cookie"]
            if cookiestr in ['', None]:
                raise RuntimeError("Cookies not found")
            matches=re.findall("%s=(\\w+)" % CookieName, cookiestr)
            if matches==[]:
                raise RuntimeError("User ID not found")
            kwargs["user_id"]=matches[0]
            return fn(self, *args, **kwargs)
        except RuntimeError, error:
            render_error(self, str(error))
    return wrapped_fn

def load_matches(key, age):
    resp=memcache.get(key)
    if resp not in ['', [], None]:
        return json_loads(resp)
    matches=[]
    for league in Leagues:
        matches+=MemBlob.fetch("%s/%s" % (key, league["name"]))
    memcache.set(key, json_dumps(matches), age)
    return matches

def load_fixtures(age=MemcacheAge):
    return load_matches("fixtures", age)

def load_results(age=MemcacheAge):
    return load_matches("results", age)

class IndexHandler(webapp2.RequestHandler):
    def get(self):
        try:
            depsstr = ",".join(["\"../%s\"" % dep for dep in Deps])
            tv = {"deps": depsstr}
            render_template(self, "templates/app.html", tv)
        except RuntimeError, error:
            render_error(self, str(error))


Routing = [('/app', IndexHandler)]

app = webapp2.WSGIApplication(Routing)

