"""
script to clean up an exotic acca to see exactly how much info is required
"""

import json

if __name__=="__main__":
    try:
        import sys, os
        if len(sys.argv) < 2:
            raise RuntimeError("Please enter filename")
        filename=sys.argv[1]
        if not os.path.exists(filename):
            raise RuntimeError("File does not exist")
        if not filename.endswith(".json"):
            raise RuntimeError("File must be a JSON file")
        struct=json.loads(file(filename).read())
        # start cleaning code
        for attr in ["bust"]:
            struct.pop(attr)
        for leg in struct["legs"]:
            for attr in ["description", "price"]:
                leg.pop(attr)
            for attr in ["1x2_prices", "kickoff", "selected"]:
                leg["match"].pop(attr)
            for attr in ["homeAway"]:
                leg["selection"].pop(attr)
        struct["size"]=10 # NB
        struct["price"]=1.01 # NB
        # end cleaning code
        destfilename="tmp/%s" % filename.split("/")[-1]
        dest=file(destfilename, 'w')
        dest.write(json.dumps(struct))
        dest.close()
    except RuntimeError, error:
        print "Error: %s" % error
    
