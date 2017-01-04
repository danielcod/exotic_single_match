"""Some top level stuff about the football-data API
"""

from sport_data_client.scrapers import *

def get_countries(*args, **kwargs):
    """- gets a list of supported countries
    - returns country name, link
    """
    return fetch_data("/api/football_data/countries", *args, **kwargs)

def get_leagues(link, *args, **kwargs):
    """- gets a list of leagues for the specified link
    - returns league name, season, link
    """
    return fetch_data("/api/football_data/leagues?link=%s" % link, *args, **kwargs)

def get_results(link, *args, **kwargs):
    """- gets a list of results for the specified link
    - returns result date, match name, score, 1x2 prices
    """
    return fetch_data("/api/football_data/results?link=%s" % link, *args, **kwargs)

class FootballDataTest(unittest.TestCase):

    def test_football_data(self, countryname="England", leaguename="Premier League", seasonname="1516"):
        print "-- Testing football-data.co.uk --"
        countries=get_countries()
        print "%i countries" % len(countries)
        countries=dict([(country["name"], country["link"])
                        for country in countries])
        if countryname not in countries:
            raise RuntimeError("%s not found" % countryname)
        leagues=get_leagues(countries[countryname])
        print "%i leagues" % len(leagues)
        def keyfn(leaguename, seasonname):
            return "%s/%s" % (leaguename, seasonname)
        leagues=dict([(keyfn(league["name"], league["season"]),
                       league["link"])
                      for league in leagues])
        if keyfn(leaguename, seasonname) not in leagues:
            raise RuntimeError("%s not found" % keyfn(leaguename, seasonname))
        results=get_results(leagues[keyfn(leaguename, seasonname)])
        print "%i results" % len(results)

if __name__=="__main__":
    unittest.main()
