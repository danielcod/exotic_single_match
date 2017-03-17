from controllers.app import *

class IndexHandler(webapp2.RequestHandler):

    @emit_json_memcache(MemcacheAge)
    def get(self):
        return Products

Routing=[('/app/products', IndexHandler)]

app=webapp2.WSGIApplication(Routing)

