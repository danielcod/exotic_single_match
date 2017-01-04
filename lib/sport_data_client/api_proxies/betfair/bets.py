"""Some top- level stuff about the Betfair Bets API
"""

from sport_data_client.api_proxies.betfair import *

Matched, Unmatched = "matched", "unmatched"

def get_bets(account_name, market_id, bet_type, *args, **kwargs):
    """- gets a list of bets for the specified account_name, market_id, bet_type (matched, unmatched)
    - returns selection, bet size, price
    - matched bets are aggregated by position; unmatched bets are not aggregated
    - unmatched bets contain additional bet_id field
    """
    return fetch_data("/betfair/bets?account=%s&market_id=%s&bet_type=%s" % (account_name, market_id, bet_type), *args, **kwargs) # NB account not account_name

def get_matched_bets(account_name, market_id, *args, **kwargs):
    """- gets matched_bets for specified account_name, market_id
    - returns bet selection, size, price
    - bets are aggregated by position
    """
    return get_bets(account_name, market_id, Matched, *args, **kwargs)

def get_unmatched_bets(account_name, market_id, *args, **kwargs):
    """- gets unmatched_bets for specified account_name, market_id
    - returns bet id, selection, size, price
    """
    return get_bets(account_name, market_id, Unmatched, *args, **kwargs)

class BetfairBetsTest(unittest.TestCase):

    def test_bets(self, accountname="woltrading", sportname="Soccer", competitionname="English Premier League", marketname="Match Odds"):
        import event_tree as tree
        print "-- Testing Betfair bets --"
        sports=tree.get_sports()
        print "%i sports" % len(sports)
        sports=dict([(sport["name"], sport["id"])
                     for sport in sports])
        if sportname not in sports:
            raise RuntimeError("%s not found" % sportname)
        competitions=tree.get_competitions(sports[sportname])
        print "%i competitions" % len(competitions)
        competitions=dict([(competition["name"], competition["id"])
                           for competition in competitions])
        if competitionname not in competitions:
            raise RuntimeError("%s not found" % competitionname)    
        events=[event for event in tree.get_events(competitions[competitionname])
                if " v " in event["name"]]
        if events==[]:
            raise RuntimeError("No %s events" % competitionname)
        print "%i events" % len(events)
        event=events[0]
        print event["name"]
        markets=tree.get_markets(event["id"])
        print "%i markets" % len(markets)
        markets=dict([(market["name"], market["id"])
                      for market in markets])
        if marketname not in markets:
            raise RuntimeError("%s not found" % marketname)
        matchedbets=get_matched_bets(accountname, 
                                     markets[marketname])
        print "%i matched bets" % len(matchedbets)
        unmatchedbets=get_unmatched_bets(accountname, 
                                         markets[marketname])
        print "%i unmatched bets" % len(unmatchedbets)

if __name__=="__main__":
    unittest.main()


