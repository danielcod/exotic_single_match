import httplib, yaml

from helpers.json_helpers import *

Endpoint="localhost:8080"

Items=yaml.load("""
- path: "/app/products/payoffs?product=single_teams&league=ENG.1"
- path: "/app/products/price"
  data: 
    product: single_teams
    query:
      league: ENG.1
      team: Chelsea
      payoff: Winner
      expiry: "2017-03-01"
""")

def get_json(path):
    http=httplib.HTTPConnection(Endpoint)
    headers={"Content-Type": "application/json"}
    http.request('GET', path, headers=headers)
    resp=http.getresponse()
    if resp.status==400:
        raise RuntimeError(resp.read())
    if resp.status!=200:
        raise RuntimeError("Server returned HTTP %i" % resp.status)
    return json_loads(resp.read())

def post_json(path, struct):
    http=httplib.HTTPConnection(Endpoint)
    payload=json_dumps(struct)
    headers={"Content-Type": "application/json",
             "Content-Length": str(len(payload))}
    http.request('POST', path, payload, headers=headers)
    resp=http.getresponse()
    if resp.status==400:
        raise RuntimeError(resp.read())
    if resp.status!=200:
        raise RuntimeError("Server returned HTTP %i" % resp.status)
    return json_loads(resp.read())

if __name__=="__main__":
    for item in Items:
        print "---------------"
        print item
        print
        url=Endpoint+item["path"]
        try:
            if "data" not in item:
                print get_json(item["path"])
            else:
                print post_json(item["path"], item["data"])
        except RuntimeError, error:
            print "Error: %s" % str(error)
