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
        # start refactoring code
        struct["type"]=struct.pop("name")
        struct["n_legs"]=struct.pop("nLegs")
        struct["n_goals"]=struct.pop("nGoals")
        for leg in struct["legs"]:
            match=leg.pop("match")
            selection=leg.pop("selection")
            leg["league"]=match["league"]
            leg["match"]=match["name"]
            leg["selection"]=selection["team"]
        # end refactoring code
        destfilename="tmp/%s" % filename.split("/")[-1]
        dest=file(destfilename, 'w')
        dest.write(json.dumps(struct))
        dest.close()
    except RuntimeError, error:
        print "Error: %s" % error
    
