"""Some top level stuff about the Oddsportal Football API
"""

from sport_data_client.scrapers.oddsportal import *

def get_leagues(*args, **kwargs):
    """- gets a list of supported leagues
    - returns league name, link
    """
    return fetch_data("/api/oddsportal/football/leagues", *args, **kwargs)

def get_upcoming_matches(link, *args, **kwargs):
    """- gets a list of upcoming matches for the specified league link
    - returns match date, name, 1x2 process
    """
    return fetch_data("/api/oddsportal/football/upcoming_matches?link=%s" % link, *args, **kwargs)

def get_seasons(link, *args, **kwargs):
    """- gets a list of seasons for the specified league link
    - returns season name, link
    """
    return fetch_data("/api/oddsportal/football/seasons?link=%s" % link, *args, **kwargs)

def get_results(link, *args, **kwargs):
    """- gets a list of results for the specified league/season link
    - returns result date, match name, score, 1x2 prices
    """
    return fetch_data("/api/oddsportal/football/results?link=%s" % link, *args, **kwargs)

class OddsportalFootballTest(unittest.TestCase):

    def test_football(self, leaguename="England Premier League", seasonname="2015/2016"):
        print "-- Testing Oddsportal football --"
        leagues=get_leagues()
        print "%i leagues" % len(leagues)
        leagues=dict([(league["name"], league["link"])
                      for league in leagues])
        if leaguename not in leagues:
            raise RuntimeError("%s not found" % leaguename)
        matches=get_upcoming_matches(leagues[leaguename])
        print "%i upcoming matches" % len(matches)
        seasons=get_seasons(leagues[leaguename])
        print "%i seasons" % len(seasons)
        seasons=dict([(season["name"], season["link"])
                      for season in seasons])
        if seasonname not in seasons:
            raise RuntimeError("%s not found" % seasonname)
        results=get_results(seasons[seasonname])
        print "%i results" % len(results)

if __name__=="__main__":
    unittest.main()
