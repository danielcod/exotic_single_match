from controllers.api.single_match import *
import base64
import urllib2


username = "yeosport"
password = "yeosport22"
base64string = base64.encodestring('%s:%s' % (username, password)).replace('\n', '')
#Example json to post: {"selection": {"home_ft": [1,4],  "btts_ft":-1}, "iD": "2522816"}
class PricerHandler(webapp2.RequestHandler):
    
    @parse_json_body
    @add_cors_headers
    @emit_json
    def post(self, bet):
        print json_dumps(bet)
        url = 'http://pricer-dot-exotic-parameter-predictions.appspot.com/price_gamev2'
        req = urllib2.Request(url)
        req.add_header("Authorization", "Basic %s" % base64string)   
        req.add_header('Content-Type', 'application/json')
        resp = urllib2.urlopen(req, json.dumps(bet)) 
        return resp.read()


Routing=[('/api/single_match/pricev2', PricerHandler)]
app=webapp2.WSGIApplication(Routing)
