from controllers.app import *

# curl "http://localhost:8080/app/product_types"
    
class IndexHandler(webapp2.RequestHandler):

    @emit_json_memcache(MemcacheAge)
    def get(self):
        return ProductTypes
    
Routing=[('/app/product_types', IndexHandler)]

app=webapp2.WSGIApplication(Routing)

