from controllers.site import *

import calendar

DesignDeps=RootDeps+["js/app/design.js"]

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

EOS=datetime.date(2017, 7, 1) 

DefaultExpiryValue=EOS

Products=yaml.load("""
- label: Single Teams Outright
  name: single_teams
- label: Mini Leagues
  name: mini_leagues
""")

DefaultProductId=0

SampleProducts=yaml.load("""
- id: 0
  type: single_teams
  query:
    league: SPA.1
    team: Barcelona
    payoff: Winner
    expiry: "2017-07-01"
""")

class LeaguesHandler(webapp2.RequestHandler):

    @emit_json
    def get(self):
        return [{"value": league["name"]}
                for league in Leagues]

def add_months(date, months):
     month=date.month-1+months
     year=int(date.year+month/12)
     month=1+month % 12
     day=min(date.day, calendar.monthrange(year, month)[1])
     return datetime.date(year, month, day)
    
class ExpiriesHandler(webapp2.RequestHandler):
    
    @emit_json
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
        for expiry in expiries:
             if expiry["value"]==DefaultExpiryValue:
                  expiry["selected"]=True                  
        return expiries
    
class InitHandler(webapp2.RequestHandler):

    @validate_query({'product_id': '^\\d+$'})
    @emit_json    
    def get(self):
        productid=self.request.get("product_id")
        products=dict([(str(product["id"]), product)
                       for product in SampleProducts])
        if productid not in products:
            raise RuntimeError("Product not found")
        product=products[productid]        
        return {"products": Products,
                "product": product}

class IndexHandler(webapp2.RequestHandler):
    
    def get(self):
        productid=self.request.get("product_id")
        if productid in ['', None, []]:
            productid=DefaultProductId
        else:
            productid=int(productid)
        depsstr=",".join(["\"../%s\"" % dep
                          for dep in DesignDeps])
        tv={"title": Title,
            "deps": depsstr,
            "product_id": productid}
        render_template(self, "templates/site/design.html", tv)

Routing=[('/site/design/leagues', LeaguesHandler),
         ('/site/design/expiries', ExpiriesHandler),
         ('/site/design/init', InitHandler),
         ('/site/design', IndexHandler)]

app=webapp2.WSGIApplication(Routing)

