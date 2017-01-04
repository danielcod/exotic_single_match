"""Some top level stuff about the Sporting Index API
"""

from sport_data_client.scrapers import *

def get_sports(*args, **kwargs):
    """- gets a list of available sports
    - returns sport name, link
    """
    return fetch_data("/api/sporting_index/sports", *args, **kwargs)

def get_groups(link, *args, **kwargs):
    """- gets a list of groups for the specified sport link
    - returns group name, link
    """
    return fetch_data("/api/sporting_index/groups?link=%s" % link, *args, **kwargs)

def get_markets(link, *args, **kwargs):
    """- gets a list of markets for the specified group link
    - returns market name, link
    """
    return fetch_data("/api/sporting_index/markets?link=%s" % link, *args, **kwargs)

def get_selections(link, *args, **kwargs):
    """- gets a list of selections for the specified market link
    - Return selection name, bid price, offer price
    """
    return fetch_data("/api/sporting_index/selections?link=%s" % link, *args, **kwargs)

class SportingIndexTest(unittest.TestCase):

    def test_football(self, sportname="Football", groupname="European German Bundesliga", marketname="Bundesliga Points 2015-16"):
        print "-- Testing Sporting Index --"
        sports=get_sports()
        print "%i sports" % len(sports)
        sports=dict([(sport["name"], sport["link"])
                     for sport in sports])
        if sportname not in sports:
            raise RuntimeError("%s not found" % sportname)
        groups=get_groups(sports[sportname])
        print "%i groups" % len(groups)
        groups=dict([(group["name"], group["link"])
                     for group in groups])
        if groupname not in groups:
            raise RuntimeError("%s not found" % groupname)
        markets=get_markets(groups[groupname])
        print "%i markets" % len(markets)
        markets=dict([(market["name"], market["link"])
                      for market in markets])
        if marketname not in markets:
            raise RuntimeError("%s not found" % marketname)
        selections=get_selections(markets[marketname])
        print "%i selections" % len(selections)

if __name__=="__main__":
    unittest.main()
