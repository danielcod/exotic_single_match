from controllers.app import *

# curl "http://localhost:8080/app/blobs?key=outright_payoffs/ENG.1"
        
class IndexHandler(webapp2.RequestHandler):

    @validate_query({'key': '.+'})
    @emit_json_memcache(MemcacheAge)
    def get(self):
        key=self.request.get("key")
        blob=Blob.get_by_key_name(key)
        if not blob:
            raise RuntimeError("Blob not found")
        return json_loads(blob.text)

Routing=[('/app/blobs', IndexHandler)]

app=webapp2.WSGIApplication(Routing)

