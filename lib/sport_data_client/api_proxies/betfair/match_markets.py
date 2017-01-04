"""Some top- level stuff about the Betfair Match Markets API
"""

from sport_data_client.api_proxies.betfair import *

def _format_prices(events):
    table=[]
    for event in events:
        for selection in event["selections"]:
            row={"event": event["event"],
                 "market": event["market"],
                 "kickoff": event["kickoff"],
                 "selection": selection["name"]}
            for attr in ["back", "lay"]:
                if attr not in selection["prices"]:
                    continue
                for i, price in enumerate(selection["prices"][attr]):    
                    sizeattr="%s_size_%i" % (attr, i+1)
                    row[sizeattr]=price["size"]
                    priceattr="%s_price_%i" % (attr, i+1)
                    row[priceattr]=price["price"]
            table.append(row)
    return sorted(table,
                  key=lambda x: "%s/%s" % (x["kickoff"],
                                           x["event"]))

def get_prices(competition_id, market_type, *args, **kwargs):
    """ - gets prices for specified competition_id, market_type (Match Odds etc)
    - returns event, kickoff, market, selections (name, back prices, lay prices)
    """
    prices=fetch_data("/betfair/match_prices?competition_id=%i&market_type=%s" % (competition_id, urllib.quote(market_type)), *args, **kwargs)
    return _format_prices(prices)

class BetfairMatchMarketsTest(unittest.TestCase):

    def test_prices(self, competition_id=31, market_type="Match Odds"):
        print "-- Testing Betfair match market prices --"
        prices=get_prices(competition_id, market_type)
        print "%i match prices" % len(prices)

if __name__=="__main__":
    unittest.main()


