from controllers.api.products import *

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

class IndexHandler(webapp2.RequestHandler):

    @parse_json_body
    @emit_json
    def post(self, struct):
        productname, query = struct["product"], struct["query"]
        if productname not in Products:
            raise RuntimeError("Product not found")
        product=Products[productname]()
        contract=product.init_contract(query)        
        payoffs=product.price_contract(contract)
        probability=payoffs[0]["value"]
        return {"probability": probability,
                "decimal_price": format_price(probability)}

Routing=[('/api/products/pricing', IndexHandler)]

app=webapp2.WSGIApplication(Routing)

