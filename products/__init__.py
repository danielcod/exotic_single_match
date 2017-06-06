from models import Fixture

from helpers.json_helpers import *

import datetime, re, yaml

def validate_quant(fn):
    def wrapped_fn(leaguenames):
        fixtures=fn(leaguenames)
        errors=[]
        for fixture in fixtures:
            if fixture["probabilities"] in ['', None, []]:
                errors.append("%s/%s" % (fixture["league"], fixture["name"]))
        if errors!=[]:
            raise RuntimeError("Following fixtures are missing yc probabilities: %s" % ", ".join(errors))
        return fixtures
    return wrapped_fn

