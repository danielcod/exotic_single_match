"""Some top level stuff about the BBC Football API
"""

from sport_data_client.scrapers import *

def get_leagues(*args, **kwargs):
    """- gets a list of all supported leagues
    - returns league name, id
    """
    return fetch_data("/api/bbc_football/leagues", *args, **kwargs)

def get_results(id, *args, **kwargs):
    """- gets a list of results for the specified league id for the current season
    - returns result date, match name, score
    """
    return fetch_data("/api/bbc_football/results?id=%s" % id, *args, **kwargs)

def get_fixtures(id, *args, **kwargs):
    """- gets a list of upcoming fixtures for the specified league id for the current season
    - returns fixture date, match name
    """
    return fetch_data("/api/bbc_football/fixtures?id=%s" % id, *args, **kwargs)

def get_table(id, *args, **kwargs):
    """- gets the current league table for the specified league id
    - returns team name, points, goal_difference, played
    """
    return fetch_data("/api/bbc_football/table?id=%s" % id, *args, **kwargs)

class BBCFootballTest(unittest.TestCase):

    def test_bbc_football(self, leaguename="Premier League"):
        print "-- Testing BBC football --"
        leagues=get_leagues()
        print "%i leagues" % len(leagues)
        leagues=dict([(league["name"], league["id"])
                      for league in leagues])
        if leaguename not in leagues:
            raise RuntimeError("%s not found" % leaguename)
        results=get_results(leagues[leaguename])
        print "%i results" % len(results)
        fixtures=get_fixtures(leagues[leaguename])
        print "%i fixtures" % len(fixtures)
        tables=get_table(leagues[leaguename])
        print "%i teams" % len(tables)

if __name__=="__main__":
    unittest.main()


