from controllers.app import *

# curl "http://localhost:8080/app/blobs?key=bets/outright_payoffs"

"""
- NB probability used in a large number of blobs for internal calculations; but don't pass directly to client
"""

class IndexHandler(webapp2.RequestHandler):

    @validate_query({'key': '.+'})
    @emit_json_memcache(MemcacheAge)
    def get(self):
        key=self.request.get("key")
        blob=Blob.get_by_key_name(key)
        if not blob:
            raise RuntimeError("Blob not found")
        items=json_loads(blob.text)
        for item in items:
            for attr in ["probability"]:
                if attr in item:
                    item.pop(attr)
        return items
        
Routing=[('/app/blobs', IndexHandler)]

app=webapp2.WSGIApplication(Routing)

