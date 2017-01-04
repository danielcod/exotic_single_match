from google.appengine.api import memcache, urlfetch

from helpers.json_helpers import *

import base64, logging, urllib

Username, Password = "admin", "Hufton123"

Timeout=30 

def rpc_get(url):
    authtoken='Basic %s' % base64.b64encode("%s:%s" % (Username, Password))
    headers={"Authorization": authtoken,
             "Accept": "application/json"}
    args={"method": "GET",
          "url": url,
          "headers": headers,
          "deadline": Timeout}
    http=urlfetch.fetch(**args)
    if http.status_code==400:
        raise RuntimeError(http.content)
    if http.status_code!=200:
        raise RuntimeError("Server returned HTTP %i" % http.status_code)
    return json_loads(http.content)

