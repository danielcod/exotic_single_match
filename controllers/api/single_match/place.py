from controllers.api.single_match import *
import base64
import urllib2


username = "yeosport"
password = "yeosport22"
base64string = base64.encodestring('%s:%s' % (username, password)).replace('\n', '')
#curl -H "Content-Type: application/json" -X POST "http://localhost:8080/api/single_match/place" -d "{\"selection\":{\"home_ft\":1,\"btts_bh\":-1,\"lower_goals_bound\":1,\"total_goals_bound\":-2.5,\"upper_goals_bound\":2}, \"number_of_winners\":2, \"stake\": 5.0, \"price\":1.0555555556, \"uid\": 1, \"id\": \"2522816\",\"currency\": \"EUR\"}"
class PlacerHandler(webapp2.RequestHandler):
    
    @parse_json_body
    @add_cors_headers
    @emit_json
    def post(self, bet):
        print json_dumps(bet)
        url = 'https://placer-dot-exotic-parameter-predictions.appspot.com/place_bet'
        req = urllib2.Request(url)
        req.add_header("Authorization", "Basic %s" % base64string)   
        req.add_header('Content-Type', 'application/json')
        resp = urllib2.urlopen(req, json.dumps(bet)) 
        return resp.read()


class PlacerHandlerV2(webapp2.RequestHandler):
    
    @parse_json_body
    @add_cors_headers
    @emit_json
    def post(self, bet):
        print json_dumps(bet)
        url = 'https://placer-dot-exotic-parameter-predictions.appspot.com/place_betv2'
        req = urllib2.Request(url)
        req.add_header("Authorization", "Basic %s" % base64string)   
        req.add_header('Content-Type', 'application/json')
        resp = urllib2.urlopen(req, json.dumps(bet)) 
        return resp.read()
        
Routing=[('/api/single_match/place', PlacerHandler), ('/api/single_match/placev2', PlacerHandlerV2)]

app=webapp2.WSGIApplication(Routing)
