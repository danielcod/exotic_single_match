from controllers.api import *

def add_cors_headers(fn):
    def wrapped_fn(self, *args, **kwargs):
        self.response.headers['Content-Type'] = 'application/json'
        self.response.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
        self.response.headers['Access-Control-Allow-Credentials'] = 'true'
        self.response.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
        self.response.headers['Access-Control-Allow-Methods'] = 'POST, GET'
        return fn(self, *args, **kwargs)
    return wrapped_fn
