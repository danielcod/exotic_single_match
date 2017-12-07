from controllers.api.single_match import *
import base64
import urllib2


username = "yeosport"
password = "yeosport22"
base64string = base64.encodestring('%s:%s' % (username, password)).replace('\n', '')
#curl -H "Content-Type: application/json" -X POST "http://localhost:8080/api/single_match/settle" -d "{\"uid\": 314}"
class SettlerHandler(webapp2.RequestHandler):
    
    @parse_json_body
    @add_cors_headers
    @emit_json
    def post(self, uid):
        #print json_dumps(uid)
        url = 'https://settler-dot-exotic-parameter-predictions.appspot.com/get_users_bets'
        req = urllib2.Request(url)
        req.add_header("Authorization", "Basic %s" % base64string)   
        req.add_header('Content-Type', 'application/json')
        resp = urllib2.urlopen(req, json.dumps(uid)) 
        return json.loads(resp.read())

class SettlerHandlerV2(webapp2.RequestHandler):
    
    @parse_json_body
    @add_cors_headers
    @emit_json
    def post(self, uid):
        #print json_dumps(uid)
        url = 'https://settler-dot-exotic-parameter-predictions.appspot.com/get_users_betsv2'
        req = urllib2.Request(url)
        req.add_header("Authorization", "Basic %s" % base64string)   
        req.add_header('Content-Type', 'application/json')
        resp = urllib2.urlopen(req, json.dumps(uid)) 
        return json.loads(resp.read())




Routing=[('/api/single_match/settle', SettlerHandler),('/api/single_match/settlev2', SettlerHandlerV2)]

app=webapp2.WSGIApplication(Routing)
