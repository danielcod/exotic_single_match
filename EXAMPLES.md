- Liverpool Outright Winner

curl "http://localhost:8080/api/pricing/positions?league=ENG.1&team=Liverpool&teams=All&payoff=Winner&use_results=true&expiry=EOS"

- Hull Relegation

curl "http://localhost:8080/api/pricing/positions?league=ENG.1&team=Hull&teams=All&payoff=Bottom&203&use_results=true&expiry=EOS"

- Liverpool end-of-season mini- league

curl "http://localhost:8080/api/pricing/positions?league=ENG.1&team=Liverpool&teams=Arsenal,Man%20Utd,Man%20City,Liverpool&payoff=Winner&use_results=false&expiry=EOS"

- Liverpool 3 week mini- league

curl "http://localhost:8080/api/pricing/positions?league=ENG.1&team=Liverpool&teams=Arsenal,Man%20Utd,Man%20City,Liverpool&payoff=Winner&use_results=false&expiry=2017-01-25"

