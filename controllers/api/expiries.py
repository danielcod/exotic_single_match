from controllers.api import *

import calendar

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

def add_months(sourcedate,months):
     month=sourcedate.month-1+months
     year=int(sourcedate.year+month/12)
     month=1+month % 12
     day=min(sourcedate.day, calendar.monthrange(year, month)[1])
     return datetime.date(year, month, day)

# curl "http://localhost:8080/api/expiries"

class IndexHandler(webapp2.RequestHandler):
    
    @emit_json_memcache(60)
    def get(self, cutoffmonth=4):
        date=datetime.date.today()
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
                         "value": EOS})
        return expiries

Routing=[('/api/expiries', IndexHandler)]

app=webapp2.WSGIApplication(Routing)
