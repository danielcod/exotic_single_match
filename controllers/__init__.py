from google.appengine.api import memcache

from models import *

from helpers.json_helpers import *

import datetime, logging, re, webapp2, yaml

MemcacheAge=60*60 # keep it long to avoid calling DB att the time

def render_error(self, msg):
    self.response.set_status(400)
    self.response.headers['Content-Type']='text/plain' 
    self.response.out.write(msg)

def render_json(self, struct):
    self.response.set_status(200)
    self.response.headers['Content-Type']='application/json'
    self.response.out.write(json_dumps(struct))

def render_template(self, path, tv):
    from google.appengine.ext.webapp import template
    self.response.set_status(200)
    self.response.headers['Content-Type']='text/html' 
    self.response.out.write(template.render(path, tv))

def validate_query(config):
    def wrap(fn):
        def wrapped_fn(self, *args, **kwargs):
            try:
                errors=[]
                for key, pattern in config.items():
                    value=self.request.get(key)
                    if value in ['', None]:
                        errors.append("Please supply '%s'" % key)
                    elif not re.search(pattern, value):
                        errors.append("'%s' is invalid" % key)
                if errors!=[]:
                    raise RuntimeError("; ".join(errors))
                fn(self, *args, **kwargs)
            except RuntimeError, error:         
                render_error(self, error)
        return wrapped_fn
    return wrap

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
