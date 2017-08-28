from google.appengine.api import memcache, taskqueue

from models import *

from controllers import render_ok, render_error, validate_query

import datetime, logging, webapp2, yaml

import apis.elisey_api as ebadi

from helpers.json_helpers import *

MemcacheAge=60*60

QueueName="default"

Leagues=dict([(league["name"], league)
              for league in yaml.load(file("config/leagues.yaml").read())])

def task(fn):
    def wrapped_fn(self, *args, **kwargs):
        try:
            fn(self, *args, **kwargs)
            render_ok(self)
        except RuntimeError, error:
            """
            don't render error; 400 response will cause queue to retry task when in all probablility it's a permanent (coding) error rather than a temporary (data/site unavailable) error
            """
            # render_error(self, str(error))
            logging.error(str(error))
            render_ok(self)
    return wrapped_fn

