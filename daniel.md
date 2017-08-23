Hi Daniel,

I've added a new branch 'dev-justin-backend' to extend and modify the API methods available from the server.

This will introduce some *breaking* changes to the API structure, so proceed with caution.

Also with regard to branching and merging strategy, please not that I have *removed* all the (old) front end code from this branch; be aware if using 'git merge' or equivalent.

These changes are not yet completed (see 'Not Yet Implemented' below) and I will have further updates later in the week.

### Fetching matches

GET /app/matches

This URL is currently unchanged

### Pricing a bet

This URL has changed from

POST /app/bets/price

to

POST /app/exotic_accas/price

The POST payload has also changed to (eg) the following -

{"n_goals": 2, "n_legs": 2, "legs": [{"league": "ENG.1", "selection": "Manchester City", "match": "Manchester City vs Everton"}, {"league": "ENG.1", "selection": "Manchester City", "match": "AFC Bournemouth vs Manchester City"}, {"league": "ENG.1", "selection": "Crystal Palace", "match": "Crystal Palace vs Swansea City"}, {"league": "ENG.1", "selection": "Huddersfield Town", "match": "Huddersfield Town vs Southampton"}], "type": "exotic_acca_winner"}

Specifically

- the 'name' field is now 'type'
- the 'nGoals' field is now 'n_goals'
- the 'nLegs' field is now 'n_legs'
- each 'leg' structure has been flattened; there are no longer separate 'match' and 'selection' sub- structures; you now simply have 'league', 'match' and 'selection' fields; 'selection' is either a team name or 'Draw'

### Authentication

For all the following actions you will need to pass a cookie with name "ioSport" and random alphanumeric value (currently not validated). This cookie value is used by the server as a user id when placing and fetching bets.

### HTTP response codes

For the following actions, a successful response will always return HTTP 200 and contain a JSON response body.

An unsuccessful response will always return HTTP 400 and contain a plain text body.

### Placing a bet

POST /app/exotic_accas/create

The payload is the same as for the pricing URL above, but you will need to add extra 'size' and 'price' parameters at the root level; so (eg)

{"n_goals": 2, "price": 1.01, "n_legs": 2, "legs": [{"league": "ENG.1", "selection": "Manchester City", "match": "Manchester City vs Everton"}, {"league": "ENG.1", "selection": "Manchester City", "match": "AFC Bournemouth vs Manchester City"}, {"league": "ENG.1", "selection": "Crystal Palace", "match": "Crystal Palace vs Swansea City"}, {"league": "ENG.1", "selection": "Huddersfield Town", "match": "Huddersfield Town vs Southampton"}], "type": "exotic_acca_winner", "size": 10}

The server will reply with (eg)

{"status": "ok", "id": 123456789}

### Getting a list of bets

GET /app/exotic_accas/list?status=(active)|(settled)

returns (active) -

[{"n_goals": 2, "legs": [{"league": "ENG.1", "match": "Manchester City vs Everton", "selection": "Manchester City"}, {"league": "ENG.1", "match": "AFC Bournemouth vs Manchester City", "selection": "Manchester City"}, {"league": "ENG.1", "match": "Crystal Palace vs Swansea City", "selection": "Crystal Palace"}, {"league": "ENG.1", "match": "Huddersfield Town vs Southampton", "selection": "Huddersfield Town"}], "n_legs": 2, "id": 5001609675276288, "price": 1.01, "type": "exotic_acca_winner", "size": 10, "timestamp": "2017-08-23 07:47:46"}, {"n_goals": 2, "legs": [{"league": "ENG.1", "match": "Manchester City vs Everton", "selection": "Manchester City"}, {"league": "ENG.1", "match": "AFC Bournemouth vs Manchester City", "selection": "Manchester City"}, {"league": "ENG.1", "match": "Crystal Palace vs Swansea City", "selection": "Crystal Palace"}, {"league": "ENG.1", "match": "Huddersfield Town vs Southampton", "selection": "Huddersfield Town"}], "n_legs": 2, "id": 6127509582118912, "price": 1.01, "type": "exotic_acca_winner", "size": 10, "timestamp": "2017-08-23 07:50:44"}]j

### Not Yet Implemented

- bet settlement / fetching of settled bets
- /app/matches is likely to change in the future

Let me know is you have any issues, questions or suggestions.

Regards,

Justin