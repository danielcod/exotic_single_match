from sport_data_client.helpers import lib_http

import unittest, urllib # urllib.quote

"""
__main__ doesn't work on AppEngine
"""

def populate_auth_kwargs(fn):
    def populate_main(kwargs, attr):
        try:
            import __main__
            sdattr="SD%s" % attr.capitalize()
            if hasattr(__main__, sdattr):
                kwargs[attr]=getattr(__main__, sdattr)
        except:
            pass
    def wrapped_fn(*args, **kwargs):
        for attr in ["realm", "username", "password"]:
            if attr not in kwargs:
                populate_main(kwargs, attr)
        return fn(*args, **kwargs)
    return wrapped_fn
