from controllers import *

from helpers.dst_helpers import *

from helpers.json_helpers import *

MemcacheAge=60*60 # keep it long to avoid calling DB att the time

def render_json(self, struct):
    self.response.set_status(200)
    self.response.headers['Content-Type']='application/json'
    self.response.out.write(json_dumps(struct))

def emit_json(fn):
    def wrapped_fn(self, *args, **kwargs):
        try:    
            struct=fn(self, *args, **kwargs)
            render_json(self, struct)
        except RuntimeError, error:  
            render_error(self, error)
    return wrapped_fn

def emit_json_memcache(age):
    def wrap(fn):
        def wrapped_fn(self, *args, **kwargs):
            try:    
                memkey="%s?%s" % (self.request.path, self.request.query_string)
                body=memcache.get(memkey)
                if body not in ['', None]:
                    # logging.info("Serving %s from memcache" % memkey)
                    struct=json_loads(body)
                else:
                    # logging.info("Generating %s" % memkey)
                    struct=fn(self, *args, **kwargs)
                    memcache.set(memkey, json_dumps(struct), age)
                render_json(self, struct)
            except RuntimeError, error:  
                render_error(self, error)
        return wrapped_fn
    return wrap

