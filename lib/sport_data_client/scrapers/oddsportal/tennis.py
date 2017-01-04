"""Some top level stuff about the Oddsportal Tennis API
"""

from sport_data_client.scrapers.oddsportal import *

def get_tournaments(*args, **kwargs):
    """- gets a list of supported tournaments
    - returns tournament name, link
    """
    return fetch_data("/api/oddsportal/tennis/tournaments", *args, **kwargs)

def get_standings_stages(link, *args, **kwargs):
    """- gets a list of standing stages for the specified tournament 
    - returns standing name, link
    - if no standing stage tabs are visible on the site, default stage name is 'Main'
    """
    return fetch_data("/api/oddsportal/tennis/standings_stages?link=%s" % link, *args, **kwargs)

def get_standings(link, *args, **kwargs):
    """- gets a list of standings for the specified tournament / standing stage
    - returns standing date, match name, score, 1x2 prices
    """
    return fetch_data("/api/oddsportal/tennis/standings?link=%s" % link, *args, **kwargs)

class OddsportalTennisTest(unittest.TestCase):

    def test_tennis(self):
        print "-- Testing Oddsportal tennis --"
        tournaments=get_tournaments()
        if tournaments==[]:
            raise RuntimeError("No tournaments found")
        print "%i tournaments" % len(tournaments)
        tournament=tournaments[0]
        print tournament["name"]
        stages=get_standings_stages(tournament["link"])
        if stages==[]:
            raise RuntimeError("No stages found")
        print "%i stages" % len(stages)
        stage=stages[0]
        print stage["name"]
        standings=get_standings(stage["link"])
        print "%i standings" % len(standings)

if __name__=="__main__":
    unittest.main()
