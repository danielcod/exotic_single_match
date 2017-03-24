Hi Elisey

We need you to help us get an algorithm running on either AWS Lambda or Google Cloud Functions.

See attached algorithm. Written in Python, accepts and returns JSON, takes about a second to run. Importantly, it is a simulation algorithm, so the time to run increases as you increase the number of paths. We are not wedded to Python; it should be easy to rewrite this algo in a number of different languages.

This algo runs fine on the desktop. The issue is that we will need to run many instances of the algo in parallel, each with different inputs. We may need to run as many as 100 per second, all independent. This is where Google Cloud Functions / AWS Lambda come in.

You will probably need to mount the algo as a HTTP POST function; then post the JSON to it, and receive JSON in return. Because of the number of simulations, we want the process to be as fast as possible. You may need to rewrite the algo in a different language with a faster VM startup time, depending on what languages. My suggestions, in priority, would be

- Go. Very fast, quick startup time. Not supported by Google cloud, possibly supported by AWS, not 100% sure. I think it may not be officially supported but there are Github projects out there which make it work

- Javascript/Node.js. Supported by both platforms. Am assuming will be fast on Google due to V8 VM, not sure which VM is used on AWS. Almost certainly faster than Python

- Python. Could use in a default situation but would likely have to find ways to speed it up. Python not currently supported on Google Cloud.

- Java. Runtime would be fast but VM startup time likely to be very slow. Don't see it as a potential candidate.

Your tasks -

- get the algo up and running on both platforms, porting to JS or other language if necessary.
- test performance on both clouds. Can we run 10 requests in parallel ? 100 requests ? How long does the entire batch take ? What are the best/average/worst individual response times ?
- can performance be improved by migrating to a different language ?
- what are the cost implications ? If we do (say) 1mm requests per day (unlikely!) what is the cost going to be for each platform ?



