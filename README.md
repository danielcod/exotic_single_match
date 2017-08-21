### initial R&D 21/8/2017

## THOUGHTS

- how does pricing code in quant/exotic_acca.py, products/exotic_acca.py overlap  ?
- which code is used by pricing controller ?
- there is no code for the app to be able to get a bet description
- there is no parameter validation code
- need endpoints for placing bet and retrieving bets
- think there was a pricing error between 1x2 and DC (zagreb)
- authorisation

## FILES

# quant/dixon_coles.py

- code for converting 1x2 to DC grid

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
