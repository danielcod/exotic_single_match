from sport_data_client import *

Endpoints={
    "dev": "localhost:8080",
    "prod": "iosport-data-proxy.appspot.com:80"
}

@populate_auth_kwargs
def fetch_data(path, realm, username, password, appengine=False):
    return lib_http.fetch_data(Endpoints[realm], path, username, password, appengine)
