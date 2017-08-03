import datetime, json, re

DatetimePattern="^\\d{4}\\-\\d{1,2}\\-\\d{1,2} \\d{2}\\:\\d{2}\\:\\d{2}$"

DatePattern="^\\d{4}\\-\\d{1,2}\\-\\d{1,2}$"

DatetimeFormat="%Y-%m-%d %H:%M:%S"

DateFormat="%Y-%m-%d"

def datetime_parse_hook(obj):
    for key, value in obj.items():
        if not (isinstance(value, str) or
                isinstance(value, unicode)):
            continue
        if re.search(DatetimePattern, value):
            obj[key]=datetime.datetime.strptime(value, DatetimeFormat)
        elif re.search(DatePattern, value):
            obj[key]=datetime.datetime.strptime(value, DateFormat).date()
    return obj

class DateTimeEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime.datetime):
            return obj.strftime(DatetimeFormat)
        elif isinstance(obj, datetime.date):
            return obj.strftime(DateFormat)
        else:
            return json.JSONEncoder.default(self, obj)

def json_loads(text):
    return json.loads(text, object_hook=datetime_parse_hook)

def json_dumps(struct):
    return json.dumps(struct, cls=DateTimeEncoder)

