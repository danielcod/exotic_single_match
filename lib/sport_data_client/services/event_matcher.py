"""Some top level stuff about the Event Matcher API
"""

from sport_data_client.services import *

import sport_data_client.services.team_matcher as team_matcher

import re

def clean_text(text):
    return " ".join([tok for tok in re.split("\\s", text)
                     if tok!=''])

def split_name(query):
    return [clean_text(name) 
            for name in re.split(" vs? ", query, re.I)]

def filter_names(queries):
    names=set()
    for query in queries:
        for name in split_name(query):
            names.add(name)
    return sorted(list(names))

@populate_auth_kwargs
def match_events(leaguename, queries, appengine=False, *args, **kwargs):   
    """- matches event name queries against a canonical list of team names
    - returns matched queries (dict) and unmatched queries (list)
    """
    resp=team_matcher.match_teams(leaguename, 
                                  queries=filter_names(queries),
                                  appengine=appengine, 
                                  *args, **kwargs)
    matched, unmatched = {}, []
    for query in queries:
        names=split_name(query)
        if (names[0] in resp["matched"] and
            names[1] in resp["matched"]):
            match0, match1 = (resp["matched"][names[0]],
                              resp["matched"][names[1]])
            matchers=(match0["matcher"],
                      match1["matcher"])
            value="%s vs %s" % (match0["value"],
                                match1["value"])
            matched[query]={"matchers": matchers,
                            "value": value}
        else:
            unmatched.append(query)
    return {"matched": matched,
            "unmatched": unmatched}

class EventMatcherTest(unittest.TestCase):

    def test_match_events(self, leaguename="ENG.1", queries=["Liverpool vs Everton", "ashduasdsad vs husadhsadd"]):
        print "-- Testing event matcher --"
        resp=match_events(leaguename, queries)
        print "Matched: %s" % ", ".join(["%s -> %s" % (key, item["value"]) for key, item in resp["matched"].items()])
        print "Unmatched: %s" % ", ".join(resp["unmatched"])

if __name__=="__main__":
    unittest.main()
