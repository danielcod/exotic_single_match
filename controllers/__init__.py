from google.appengine.api import memcache

from models import *

from helpers.json_helpers import *

import datetime, logging, re, webapp2, yaml

def render_text(self, msg):
    self.response.set_status(200)
    self.response.headers['Content-Type']='text/plain' 
    self.response.out.write(msg)

def render_ok(self):
    render_text(self, "ok")

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

def render_html(self, doctext):
    self.response.set_status(200)
    self.response.headers['Content-Type']='text/html' 
    self.response.out.write(doctext)

def render_audio(self, stuff):
    self.response.set_status(200)
    self.response.headers['Content-Type']='audio/mp3' 
    self.response.out.write(stuff)

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
