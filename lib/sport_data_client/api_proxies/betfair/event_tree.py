"""Some top- level stuff about the Betfair Event Tree API
"""

from sport_data_client.api_proxies.betfair import *

Table="table"

def get_sports(*args, **kwargs):
    """- gets a list of supported sports
    - returns sport name, id
    """
    return fetch_data("/betfair/sports", *args, **kwargs)

def get_competitions(sport_id, *args, **kwargs):
    """- gets a list of competitions for the specified sport_id
    - returns competition name, id 
    """
    return fetch_data("/betfair/competitions?sport_id=%s" % sport_id, *args, **kwargs)

def get_events(competition_id, *args, **kwargs):
    """- gets a list of events for the specified competition_id
    - returns event name, id 
    """
    return fetch_data("/betfair/events?competition_id=%s" % competition_id, *args, **kwargs)

def get_markets(event_id, *args, **kwargs):
    """- gets a list of markets for the specified event_id
    - returns market name, id 
    """
    return fetch_data("/betfair/markets?event_id=%s" % event_id, *args, **kwargs)

def _format_prices(selections, depth):
    table=[]
    for selection in selections:
        row={"name": selection["name"]}
        for backlay in ["back", "lay"]:
            for i, price in enumerate(selection["prices"][backlay][:depth]):
                priceattr="%s_price_%i" % (backlay, i+1)
                row[priceattr]=price["price"]
                sizeattr="%s_size_%i" % (backlay, i+1)
                row[sizeattr]=price["size"]
        table.append(row)
    return table

def get_prices(market_id, depth, *args, **kwargs):
    """- gets a table of prices for the specified market_id, depth
    - returns selection name, prices, sizes 
    """
    prices=fetch_data("/betfair/prices?market_id=%s" % market_id, *args, **kwargs)
    return _format_prices(prices, depth)

class BetfairEventTreeTest(unittest.TestCase):

    def test_event_tree(self, accountname="woltrading", sportname="Soccer", competitionname="English Premier League", marketname="Match Odds", depth=3):
        print "-- Testing Betfair event tree --"
        sports=get_sports()
        print "%i sports" % len(sports)
        sports=dict([(sport["name"], sport["id"])
                     for sport in sports])
        if sportname not in sports:
            raise RuntimeError("%s not found" % sportname)
        competitions=get_competitions(sports[sportname])
        print "%i competitions" % len(competitions)
        competitions=dict([(competition["name"], competition["id"])
                           for competition in competitions])
        if competitionname not in competitions:
            raise RuntimeError("%s not found" % competitionname)    
        events=[event for event in get_events(competitions[competitionname])
                if " v " in event["name"]]
        if events==[]:
            raise RuntimeError("No %s events" % competitionname)
        print "%i events" % len(events)
        event=events[0]
        print event["name"]
        markets=get_markets(event["id"])
        print "%i markets" % len(markets)
        markets=dict([(market["name"], market["id"])
                      for market in markets])
        if marketname not in markets:
            raise RuntimeError("%s not found" % marketname)
        prices=get_prices(markets[marketname], 
                          depth)
        print "%i prices" % len(prices)

if __name__=="__main__":
    unittest.main()


