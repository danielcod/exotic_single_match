"""Some top level stuff about the Team Matcher API
"""

from sport_data_client.services import *

@populate_auth_kwargs
def get_teams(leaguename, appengine=False, *args, **kwargs):
    """- returns a list of team matcher teams for league name
    """
    realm=kwargs.pop("realm")
    endpoint=TeamMatcherEndpoints[realm]
    path="/api/teams/list?league=%s" % leaguename
    return lib_http.fetch_data(endpoint=endpoint,
                               path=path,
                               appengine=appengine,
                               *args, **kwargs)

@populate_auth_kwargs
def match_teams(leaguename, queries, appengine=False, *args, **kwargs):   
    """- matches team name queries against a canonical list of team names
    - returns matched queries (dict) and unmatched queries (list)
    """
    realm=kwargs.pop("realm")
    endpoint=TeamMatcherEndpoints[realm]
    path="/api/search?league=%s" % leaguename
    return lib_http.fetch_data(endpoint=endpoint,
                               path=path,
                               struct=queries,
                               appengine=appengine,
                               *args, **kwargs)
        
class TeamMatcherTest(unittest.TestCase):

    def test_get_teams(self, leaguename="ENG.1"):
        print "-- Testing get_teams --"
        teams=get_teams(leaguename)
        print "%i teams" % len(teams)

    def test_match_teams(self, leaguename="ENG.1", queries=["Arsenal", "Asrenal", "Foobar"]):
        print "-- Testing match_teams --"
        resp=match_teams(leaguename, queries)
        print "Matched: %s" % ", ".join(["%s -> %s" % (key, item["value"]) for key, item in resp["matched"].items()])
        print "Unmatched: %s" % ", ".join(resp["unmatched"])

if __name__=="__main__":
    unittest.main()
