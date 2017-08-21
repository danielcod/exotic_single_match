### initial r&d 21/8/2017

## APP

- fetches match data for display in app
- includes 1x2 price data (used in display) but strips DC data

curl "http://localhost:8080/app/matches"

## TASKS

# load data

- fetches data from elisey API including 1x2 prices
- calcs Dixon Coles probabilities for each match

curl "http://localhost:8080/tasks/app/matches?window=7"
