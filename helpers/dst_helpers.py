"""
providers will typically return GMT, which in summer is 1 hr behind local time due to DST adjustment
so if a date is in summer, add back 1 hr so is adjusted for DST
"""

import datetime

Intervals=[datetime.datetime(*args)
           for args in [[2014, 3, 30, 1, 0, 0],
                        [2014, 10, 26, 2, 0, 0],
                        [2015, 3, 29, 1, 0, 0], 
                        [2015, 10, 25, 2, 0, 0],
                        [2016, 3, 27, 1, 0, 0], 
                        [2016, 10, 30, 2, 0, 0],
                        [2017, 3, 26, 1, 0, 0], 
                        [2017, 10, 29, 2, 0, 0],
                        [2018, 3, 25, 1, 0, 0], 
                        [2018, 10, 28, 2, 0, 0]]]

def count_intervals(kickoff):
    count=0
    for interval in Intervals:
        if kickoff > interval:
            count+=1
        else:
            break
    return count

def dst_adjust(kickoff):
    n=count_intervals(kickoff)
    adj=datetime.timedelta(hours=[0, 1][n % 2])
    return kickoff+adj

if __name__=="__main__":
    print dst_adjust(datetime.datetime.now())
