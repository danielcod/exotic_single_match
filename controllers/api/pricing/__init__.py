from controllers.api import *

import apis.yc_lite_api as yc_lite

MaxProb, MinProb, MinPrice, MaxPrice = 0.99, 0.01, 1.001, 100

def format_price(probability):
    if probability < MinProb:
        price=MaxPrice
    elif probability > MaxProb:
        price=MinPrice
    else:
        price=1/float(probability)
    if price < 2:
        return "%.3f" % price
    elif price < 5:
        return "%.2f" % price
    else:
        return "%.1f" % price

