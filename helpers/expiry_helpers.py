from helpers import *

import datetime, yaml

def end_of_season(today):
    if today.month < 7:
        return datetime.date(today.year, 6, 30)
    else:
        return datetime.date(today.year+1, 6, 30)

EndOfSeason=end_of_season(datetime.date.today())

Months=yaml.load("""
- January
- February
- March
- April
- May
- June
- July
- August
- September
- October
- November
- December
""")

ShortMonths=[month[:3]
             for month in Months]

Days=yaml.load("""
- Monday
- Tuesday
- Wednesday
- Thursday
- Friday
- Saturday
- Sunday
""")

ShortDays=[day[:3]
           for day in Days]

def end_of_season(today):
    if today.month < 7:
        return datetime.date(today.year, 7, 1)
    else:
        return datetime.date(today.year+1, 7, 1)

EOSDate=end_of_season(datetime.date.today())
    
def cardinal_suffix(i):
    if (1==(i % 10) and i!=11):
        return "st"
    elif (2==(i % 10) and i!=12):
        return "nd"
    elif (3==(i % 10) and i!=13):
        return "rd"
    else:
        return "th"

def format_date(date):
    return "%s %s %i%s" % (ShortDays[date.weekday()],
                           ShortMonths[date.month-1],
                           date.day,
                           cardinal_suffix(date.day))

def init_expiries(offset=14):
    date=datetime.date.today()+datetime.timedelta(days=offset)
    items=[]
    while True:
        if date > EndOfSeason:
            break
        item={"value": date,
              "label": format_date(date)}
        items.append(item)
        date+=datetime.timedelta(days=1)
    return items
        
if __name__=="__main__":
    print init_expiries()
