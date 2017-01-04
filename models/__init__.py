from google.appengine.api import memcache

from google.appengine.ext import db

from helpers.json_helpers import *

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

class Event(db.Model):

    source=db.StringProperty()
    league=db.StringProperty()
    name=db.StringProperty() # "A vs B"
    kickoff=db.DateTimeProperty()
    date=db.DateProperty()
    timestamp=db.DateTimeProperty()
    status=db.StringProperty() # result, fixture etc
    pre_event_prices=db.ListProperty(item_type=float)
    settlement_prices=db.ListProperty(item_type=float)
    score=db.ListProperty(item_type=int)
  
    @classmethod
    def key_name(self, params):
        return "%s/%s/%s" % (params["source"],
                             params["league"], 
                             params["name"])

    """
    - status not referenced here
    - use kickoff to filter fixtures
    - an event with status==Fixture still has useful 1x2 prices for a results / training set request
    """

    @classmethod
    def find_all(self, leaguename, cutoff=None):
        query=Event.all()
        query.filter("league = ", leaguename)
        if cutoff:
            query.filter("kickoff > ", cutoff)
        memkey="events/%s/%s" % (leaguename, cutoff)
        return fetch_models_memcache(Event, memkey, query)
