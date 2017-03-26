from helpers import *

import datetime, yaml

def end_of_season(today):
    if today.month < 7:
        return datetime.date(today.year, 6, 30)
    else:
        return datetime.date(today.year+1, 6, 30)

EndOfSeason=end_of_season(datetime.date.today())

def init_expiries(offset=14):
    date=datetime.date.today()+datetime.timedelta(days=offset)
    items=[]
    while True:
        if date > EndOfSeason:
            break
        item={"value": date}
        items.append(item)
        date+=datetime.timedelta(days=1)
    return items
        
if __name__=="__main__":
    print init_expiries()
