from tasks import *

import sport_data_client.services.event_matcher as event_matcher

QueueName="scrapers"

SDKwargs=yaml.load("""
realm: prod
username: admin
password: Hufton123
appengine: true
""")

DefaultDateCutoff=datetime.date(2016, 7, 15)

DateCutoffs={"NOR.1": datetime.date(2016, 3, 10),
             "SWE.1": datetime.date(2016, 4, 1)}

def get_date_cutoff(leaguename):
    if leaguename in DateCutoffs:
        return DateCutoffs[leaguename]
    return DefaultDateCutoff
