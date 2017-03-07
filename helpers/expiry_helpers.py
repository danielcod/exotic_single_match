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

def end_of_season(today):
    if today.month < 7:
        return datetime.date(today.year, 7, 1)
    else:
        return datetime.date(today.year+1, 7, 1)

EOSDate=end_of_season(datetime.date.today())
    
EOSLabel="End of Season"

def cardinal_suffix(i):
    if (1==(i % 10) and i!=11):
        return "st"
    elif (2==(i % 10) and i!=12):
        return "nd"
    elif (3==(i % 10) and i!=13):
        return "rd"
    else:
        return "th"

def add_months(date, months):
    month=date.month-1+months
    year=int(date.year+month/12)
    month=1+month % 12
    day=min(date.day, calendar.monthrange(year, month)[1])
    return datetime.date(year, month, day)

def eom_date(date):
    mrange=calendar.monthrange(date.year, date.month)
    return datetime.date(date.year, date.month, mrange[-1])
    
def format_date(date):
    if date==EOSDate:
        return EOSLabel
    eomdate=eom_date(date)
    if date==eomdate:
        return "End of %s" % ShortMonths[date.month-1]
    else:
        return "%s %i%s" % (ShortMonths[date.month-1],
                            date.day,
                            cardinal_suffix(date.day))
    
def init_expiries(cutoffmonth=4):
    date=datetime.date.today()
    def init_item(date):
        return {"value": date,
                # "label": format_date(date),
                "label": date.strftime("%Y-%m-%d")}
    item=init_item(eom_date(date))
    expiries=[item]
    while True:
        date=add_months(date, 1)
        item=init_item(eom_date(date))
        expiries.append(item)
        if date.month >= cutoffmonth:
            break
    expiries.append(init_item(EOSDate))
    return expiries

if __name__=="__main__":
    print init_expiries()
