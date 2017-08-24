from controllers import *

Leagues=yaml.load(file("config/leagues.yaml").read())

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

def load_fixtures():
    fixtures=[]
    for league in Leagues:
        fixtures+=MemBlob.fetch("fixtures/%s" % league["name"])
    return fixtures

def load_results():
    results=[]
    for league in Leagues:
        results+=MemBlob.fetch("results/%s" % league["name"])
    return results

