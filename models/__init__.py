from google.appengine.api import memcache

from google.appengine.ext import db

DefaultBatchSize=1000

DefaultMemAge=60 # seconds

DefaultBatchSize=250

def fetch_models_db(query,                     
                    projection=None,
                    keys_only=False, 
                    batchsize=DefaultBatchSize):
    results, cursor = [], None
    while True:
        if cursor:
            query.with_cursor(cursor)
        batch=query.fetch(batchsize, 
                          projection=projection,
                          keys_only=keys_only)
        results+=batch
        if len(batch) < batchsize:
            break
        cursor=query.cursor()
    return results

"""
NB there is an an approximate 1MB limit on single items in memcache
see http://blog.notdot.net/2009/9/Efficient-model-memcaching for alternative serialisation scheme; prefer JSON as more transparent
"""

def fetch_models_memcache(klass, memkey, query, memage=DefaultMemAge):
    body=memcache.get(memkey)
    if body not in ['', None]:
        return [klass(**params) 
                for params in json_loads(body)]
    models=fetch_models_db(query)
    payload=json_dumps([model.to_json()
                        for model in models])
    memcache.set(memkey, payload, memage)
    return models

def to_json(self, fields=[], extras=[]):    
    if fields in [None, []]:
        fields=self.properties().keys()
    fields+=extras
    struct={}
    if self.is_saved():
        struct["key_name"]=self.key().name()
        struct["id"]=self.key().id()
    for field in fields:
        attr=getattr(self, field)
        if callable(attr):
            struct[field]=attr()
        else:
            struct[field]=attr
    return struct

db.Model.to_json=to_json # ** NB **

class Article(db.Model):

    name=db.StringProperty()
    lang=db.StringProperty()
    chunks=db.IntegerProperty()

    @classmethod
    def find_all(self):
        query=Article.all()
        return fetch_models_db(query)

class Chunk(db.Model):

    article=db.StringProperty()
    text=db.TextProperty()
    index=db.IntegerProperty()
    
    @classmethod
    def find_all(self, articlename):
        query=Chunk.all()
        query.filter("article = ", articlename)
        return fetch_models_db(query)
    
