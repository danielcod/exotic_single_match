from helpers import *

import calendar, datetime, yaml

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

def cardinal_suffix(i):
    if (1==(i % 10) and i!=11):
        return "st"
    elif (2==(i % 10) and i!=12):
        return "nd"
    elif (3==(i % 10) and i!=13):
        return "rd"
    else:
        return "th"

def end_of_season(today):
    if today.month < 7:
        return datetime.date(today.year, 7, 1)
    else:
        return datetime.date(today.year+1, 7, 1)

def add_months(date, months):
    month=date.month-1+months
    year=int(date.year+month/12)
    month=1+month % 12
    day=min(date.day, calendar.monthrange(year, month)[1])
    return datetime.date(year, month, day)

def init_expiries(cutoffmonth=4):    
    date=datetime.date.today()
    eos=end_of_season(date)
    def init_item(date):
        mrange=calendar.monthrange(date.year, date.month)
        eomdate=datetime.date(date.year, date.month, mrange[-1])
        eomlabel="End of %s" % ShortMonths[date.month-1]
        return {"value": eomdate,
                "label": eomlabel}
    expiries=[init_item(date)]
    while True:
        date=add_months(date, 1)
        expiries.append(init_item(date))
        if date.month >= cutoffmonth:
            break
    expiries.append({"label": "End of Season",
                     "value": eos})
    return expiries

if __name__=="__main__":
    print init_expiries()
