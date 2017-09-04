### initial R&D 21/8/2017

## UI

- when you change the goals selector, price doesn't blank ("[..]")
- shouldn't there be a confirmation stage between placing bet ?
- does app call server before placing bet ?
- does app pass a user token to server ?

## THOUGHTS

- there is no parameter validation code
- need endpoints for placing bet and retrieving bets
- think there was a pricing error between 1x2 and DC (zagreb)
- authorisation
- SETTLEMENT

## FILES

# quant/dixon_coles.py

- code for converting 1x2 to DC grid

run
python2.7 /home/incode2015/google-cloud-sdk/platform/google_appengine/dev_appserver.py  .
# quant/exotic_acca.py

- code for pricing exotic acca

# products/exotic_acca.py

- code for pricing and description of exotic acca

## APP

- price bet

curl -X POST http://localhost:8080/app/bets/price -d @dev/bet.json

- fetches match data for display in app
- includes 1x2 price data (used in display) but strips DC data

curl "http://localhost:8080/app/matches"

## TASKS

- fetches data from elisey API including 1x2 prices
- calcs Dixon Coles probabilities for each match

curl "http://localhost:8080/tasks/app/matches?window=7"
