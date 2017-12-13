from controllers.api.single_match import *
import base64
import urllib2
# curl "http://localhost:8080/api/single_match/legs"

username = "yeosport"
password = "yeosport22"
base64string = base64.encodestring('%s:%s' % (username, password)).replace('\n', '')

#OLD EP only for V1
class IndexHandler(webapp2.RequestHandler):

    #@emit_json_memcache(MemcacheAge)
    @add_cors_headers
    @emit_json
    def get(self):
        import urllib
        return json_loads(urllib.urlopen("https://interface-dot-exotic-parameter-predictions.appspot.com/get_games").read())

#New EP for V2
class LegsHandler(webapp2.RequestHandler):

    @add_cors_headers
    @emit_json
    def get(self,league="ENG.1"):
        url = "https://interface-dot-exotic-parameter-predictions.appspot.com/legs?leagues=[\"%s\"]" % league
        print url  
        req = urllib2.Request(url)
        req.add_header("Authorization", "Basic %s" % base64string)
        resp = urllib2.urlopen(req)
        return json.loads(resp.read())
Routing=[('/api/single_match/legs', IndexHandler), ('/api/single_match/legsv2', LegsHandler)]

app=webapp2.WSGIApplication(Routing)

