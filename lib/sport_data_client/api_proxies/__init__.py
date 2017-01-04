from sport_data_client import *

"""
assumes that in future all API proxies will be part of a single server
"""

Endpoints={
    "dev": "localhost:8080",
    "prod": "52.49.122.27:80" 
}

@populate_auth_kwargs
def fetch_data(path, realm, username, password, appengine=False):
    return lib_http.fetch_data(Endpoints[realm], path, username, password, appengine)


