from controllers.api.single_match import *
import urllib2
import base64

username = "yeosport"
password = "yeosport22"
base64string = base64.encodestring('%s:%s' % (username, password)).replace('\n', '')
# curl "http://localhost:8080/api/single_match/curates"

class IndexHandler(webapp2.RequestHandler):

    #@emit_json_memcache(MemcacheAge)
    @add_cors_headers
    @emit_json
    def get(self):
        import urllib
        return json_loads(urllib.urlopen("https://curator-dot-exotic-parameter-predictions.appspot.com/curate").read())



class CurateHandler(webapp2.RequestHandler):

    #@emit_json_memcache(MemcacheAge)
    @add_cors_headers
    @emit_json
    def get(self):
        #import urllib
        req = urllib2.Request('https://curator-dot-exotic-parameter-predictions.appspot.com/curated_feed')
        req.add_header("Authorization", "Basic %s" % base64string)
        resp = urllib2.urlopen(req)
        return json.loads(resp.read())

Routing=[('/api/single_match/curates', IndexHandler), ('/api/single_match/curatesv2', CurateHandler)]

app=webapp2.WSGIApplication(Routing)

