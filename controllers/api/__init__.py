from controllers import *

from helpers.dst_helpers import *

MemcacheAge=60*60 # keep it long to avoid calling DB att the time

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

def parse_json_body(fn):
    def wrapped_fn(self, *args, **kwargs):
        try:
            try:                
                struct=json_loads(self.request.body)            
            except:
                raise RuntimeError("Error parsing JSON body")
            fn(self, struct, *args, **kwargs)
        except RuntimeError, error:         
            render_error(self, error)
    return wrapped_fn
