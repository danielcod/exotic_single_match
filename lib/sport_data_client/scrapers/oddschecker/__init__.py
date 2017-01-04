"""Some top level stuff about the Oddschecker API
"""

from sport_data_client.scrapers import *

def get_match_events(link, *args, **kwargs):
    """- gets a list of match events for the specified link
    - returns event name, link
    """
    return fetch_data("/api/oddschecker/match_events?link=%s" % link, *args, **kwargs)

def get_match_markets(link, *args, **kwargs):
    """- gets a list of match markets for the specified link
    - returns market name, link
    """
    return fetch_data("/api/oddschecker/match_markets?link=%s" % link, *args, **kwargs)

def get_outright_markets(link, *args, **kwargs):
    """- gets a list of outright markets for the specified link
    - returns market name, link
    """
    return fetch_data("/api/oddschecker/outright_markets?link=%s" % link, *args, **kwargs)

def get_selections(link, *args, **kwargs):
    """- gets a list of selections for the specified link
    - returns selection name, bookmaker name, price
    """
    return fetch_data("/api/oddschecker/selections?link=%s" % link, *args, **kwargs)


