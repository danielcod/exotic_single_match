from controllers.api import *

from quant.multi_match.dixon_coles import *

import quant.multi_match.products as products

Products=yaml.load(file("config/multi_match_products.yaml").read())

Seed, Paths = 13, 5000

MemcacheAge=60

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

def add_cors_headers(fn):
    def wrapped_fn(self, *args, **kwargs):
        self.response.headers['Content-Type'] = 'application/json'
        self.response.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
        self.response.headers['Access-Control-Allow-Credentials'] = 'true'
        self.response.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
        self.response.headers['Access-Control-Allow-Methods'] = 'POST, GET'
        return fn(self, *args, **kwargs)
    return wrapped_fn
