from google.appengine.api import taskqueue

from models import *

from controllers import render_ok, render_error, validate_query

import datetime, logging, webapp2, yaml

from helpers.dst_helpers import dst_adjust

DefaultQueue="default"

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

