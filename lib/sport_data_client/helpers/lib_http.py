from sport_data_client.helpers.json_helpers import *

AppEngineDeadline=30

def basic_auth_header(username, password):
    import base64
    return 'Basic %s' % base64.b64encode("%s:%s" % (username, password))

def fetch_data_httplib(endpoint, path, username, password, struct=None):
    import httplib
    http=httplib.HTTPConnection(endpoint)
    authheaderval=basic_auth_header(username, password)
    headers={'Authorization': authheaderval,
             'Accept': "application/json"}
    if struct:
        headers["Content-Type"]="application/json"
        http.request('POST', path, 
                    headers=headers,
                     body=json_dumps(struct))
    else:
        http.request('GET', path, 
                     headers=headers)
    resp=http.getresponse()
    if resp.status/100==4:
        raise RuntimeError(resp.read())
    return json_loads(resp.read())

def fetch_data_urlfetch(endpoint, path, username, password, struct=None, deadline=AppEngineDeadline):
    from google.appengine.api import urlfetch
    url="http://%s%s" % (endpoint, path)
    authheaderval=basic_auth_header(username, password)
    headers= {'Authorization': authheaderval,
              'Accept': "application/json"}
    args={"url": url,
          "headers": headers,
          "allow_truncated": False, 
          "follow_redirects": False, 
          "validate_certificate": False,
          "deadline": deadline}
    if struct:
        args["method"]="POST"
        headers["Content-Type"]="application/json"
        args["payload"]=json_dumps(struct)
    else:
        args["method"]="GET"
    resp=urlfetch.fetch(**args)
    if resp.status_code/100==4:
        raise RuntimeError(resp.content)
    return json_loads(resp.content)

def fetch_data(endpoint, path, username, password, appengine, struct=None):
    if appengine:
        return fetch_data_urlfetch(endpoint, path, username, password, struct)
    else:
        return fetch_data_httplib(endpoint, path, username, password, struct)

"""
python sport_data_client/helpers/lib_http.py "52.49.122.27:80" "/sports" "admin" "Hufton123" "false"
python sport_data_client/helpers/lib_http.py "52.49.122.27:80" "/sports" "admin" "Hufton123" "true"
"""

if __name__=="__main__":
    try:
        import sys
        if len(sys.argv) < 6:
            raise RuntimeError("Please enter endpoint, path, username, password, appengine flag")
        endpoint, path, username, password, appengine = sys.argv[1:6]
        if appengine.lower() not in ["true", "false"]:
            raise RuntimeError("Appengine flag is invalid")
        appengine=eval(appengine.capitalize())
        from google.appengine.ext import testbed
        tb=testbed.Testbed()
        tb.activate()
        tb.init_urlfetch_stub()
        print fetch_data(endpoint, path, username, password, appengine)
    except RuntimeError, error:
        print "Error: %s" % str(error)
