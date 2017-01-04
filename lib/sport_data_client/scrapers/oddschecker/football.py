"""Some top level stuff about the Oddschecker Football API
"""

from sport_data_client.scrapers.oddschecker import *

Elite, World, All = "elite", "world", "all"

def get_leagues(group=Elite, *args, **kwargs):
    """- gets a list of leagues for a specified group
    - Supported groups are 'elite', 'world', 'all'; default value is 'elite'
    - returns league name, link
    """
    return fetch_data("/api/oddschecker/football/leagues?group=%s" % group, *args, **kwargs)

class OddscheckerFootballTest(unittest.TestCase):

    def test_matches(self, leaguename="English Premier League"):
        print "-- Testing Oddschecker football matches --"
        leagues=get_leagues(group="all")
        print "%i leagues" % len(leagues)
        leagues=dict([(league["name"], league["link"])
                      for league in leagues])
        if leaguename not in leagues:
            raise RuntimeError("%s not found" % leaguename)
        events=get_match_events(leagues[leaguename])
        if events==[]:
            raise RuntimeError("No %s events" % leaguename)
        print "%i events" % len(events)
        event=events[0]
        markets=get_match_markets(event["link"])
        if markets==[]:
            raise RuntimeError("No match markets")
        print "%i markets" % len(markets)
        market=markets[0] # Winner/Match Odds
        selections=get_selections(market["link"])
        print "%i selections" % len(selections)

    def test_outrights(self, leaguename="English Premier League"):
        print "-- Testing Oddschecker football outrights --"
        leagues=get_leagues(group="all")
        print "%i leagues" % len(leagues)
        leagues=dict([(league["name"], league["link"])
                      for league in leagues])
        if leaguename not in leagues:
            raise RuntimeError("%s not found" % leaguename)
        markets=get_outright_markets(leagues[leaguename])
        if markets==[]:
            raise RuntimeError("No outright markets")
        print "%i markets" % len(markets)
        market=markets[0] # Winner
        selections=get_selections(market["link"])
        print "%i selections" % len(selections)

if __name__=="__main__":
    unittest.main()
