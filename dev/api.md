### Overview

The Team Exotics ('TE') API is a service which facilitates operators in the pricing, tracking and settlement of TE- style bets (defined below), designed and entered into by their respective customers.

A TE bet is loosely defined as incorporating one or more of the following elements - 

- a underlying single bet or collection of single bets on standard 'goals based' events (football: match winner, correct score, goals scored etc) or more 'exotic' match events (football: cards, corners, goalscorers etc)
- an accumulator layer (assuming more than one underlying single bet is chosen)
- a set of 'exotic' accumulator conditions; not all underlying single bets have to win in order for the accumulator to pay out

For example: Man Utd vs Man City, at least three of the following things to happen

- Man Utd to win
- more than 2.5 goals in total
- more than 5 corners in total
- Ivanisevic to score
- Rooney to receive a yellow card

Clearly there are a very large number of potential combinations here, more than can be feasibly served up as a fixed set of options. The product is likely to appeal to customers who are interested in 'designing their own acca', which is in turn likely to require a dedicated user interface ('UI') allowing customers to browse, and explore different combinations.

ioSport will provide a reference iFrame implementation of such a UI; this reference UI will use the ioSport TE API behind the scenes.

We are aware however that many operators require more fine grained control over their user experience and are interested in designing their own TE UIs. We are accordingly making the TE API available to selected operators who are interested in doing their own UI work, and will work with those operators to achieve successful integration of the TE API.

### Core API Concepts

# 'Guest Mode' vs 'Bet Mode'

Operators are likely to have a large number of customers operating in 'Guest Mode'; playing with different conditions, experimenting with different price combinations, possibly anonymously, but not placing a bet. The TE API supports a number of Guest Mode actions which are focused on product design and price discovery; essentially a set of actions which allow the client UI to load the full set of possible combinations for different TE products so that product option can be successfully rendered to the client.

A smaller number of customers are likely to place bets. The TE API provides a number of actions which allow an operator to track a bet and get description and settlement details for the exchange of a simple bet id (see below).

# Bet Ids

The key concept behind the API is of the 'bet id'; essentially a reference to a bet created on the TE servers. This bet may be a product which has been created in Guest Mode but has yet to be placed, or may be a product in Bet Mode which a customer has placed with a stake. Either way, the operator can pass the bet id to one of the TE API calls and in return receive a description, a price and settlement information for that bet.

### API Design

- the API will designed using the standard JSON-over-HTTPS pattern

## Authentication

Operators will need to authenticate with the TE API. It is likely that ioSport will assign each operator a unique TE API key. Initial connection with the API will require a call to the following URL

URL: POST /api/login "api_key=#{APIKey}"

returns {"status": "ok|error", "message": "#{error_message}"}

Upon successful login the TE server will reply with a standard HTTP[S] authentication cookie which must be used for successful completion of subsequent API calls.

It is likely that authetication cookie will expire after a fixed time (probably 1hr) requiring periodic re- authentication

# League/Team/Matches

Many products will require a list of leagues/teams/matches to be presented to the customer, from which options can be selected. Accordingly the API will provide the following helper methods

URL: GET /api/leagues

returns [{"name": "ENG.1", "full_name": "English Premier League"}, {..}]

URL: GET /api/teams?league=#{league_name}

returns [{"name": "Arsenal"}, {..}]

URL: GET /api/matches?league=#{league_name}

returns [{"name": "Arsenal vs Liverpool"}, {..}]

URL: GET /api/goalscorers?league=#{league_name}

returns [{"name": "Ivanisevic", "team": "Man Utd"}, {..}]

# Products

ioSport have a 'market bible' of different product types which are made up of different conditions and payoffs

URL: GET /api/products

returns [{"name": "Match Winners"}, {"name": "Match Losers"}, {..}]

It is likely the user will need to be presented with a list of TE products they can select at the top of any UI

# Product Pricing

Each product type will require a particular JSON struct to be sent to the TE sererver for pricing. For example, here is a JSON struct which represents a 'Market Winner' bet

{"matches": [{"league": "ENG.1", "event": "Liverpool vs Everton", "selection", "Liverpool"}, {"league": "SPA.1", "event": "Barcelona vs Real Madrid", "selection": "Real Madrid"}, {"league": "ITA.1", "event": "Juventus vs Napoli", "selection": "Napoli"}], "acca_conditions: [{"type": "wins", "condition": "greater_than", "value": 1}]}

This represents a accumulator bet on Liverpool (vs Everton), Real Madrid (vs Barcelona) and Napoli (Vs Juventus) where there are at least two wins for the selected teams (greater than one win)

The "acca_conditions" field is represented as list because you could add more than one condition; potentially there could be a second condition where each winning team must win by more than two goals; we will exclude this possibility for the time being and just note that the option is there.

The UI designed by the operator must HTTP POST these JSON structures to the TE server for pricing. However because of the potentially complext nature of these structures it is important to validate ('price') them first with the server.

*ioSport will provide JSON schema for each product type to facilitate the operator in the design of the UI to represent the product*

URL: POST /api/bets/price -d "#{json_bet_struct}"

returns {"status": "ok|error", "bet_id": "#{bet_id"}, "price": "#{price"}, "message": "#{error_message}"}

- price and bet_id are only returned in the situation where the product is valid
- error messages are only returned in the event of a validation error

Pricing is a crucial step because it returns a bet_id to the operator; this confirms that a bet structure is valid, but also provides a simple reference for the operator to use when requesting more actions with respect to that bet, without have to specify/transfer the bet details every time.

If a customer wants to modify a bet by adding a leg or changing any of the details, the new bet must be repriced and a new bet_id obtained.

# Placing Bet

Having priced the bet, the resulting bet_id is then used to place a bet on the ioSport servers. Bet placement is an important step because it registers a bet as an entity which will need to be tracked and settled for an operator, as opposed to being a guest bet which can be discarded after a period of time.

URL: POST /api/bets/create "bet_id=#{bet_id}&stake=#{stake}&price=#{price}"

returns: {"status": "ok|error", "message": "#{error_message}"

- message is returned if there is an error

# Bet Description/Status

Once the bet has been placed the operator can poll the TE servers for a text description of the bet, or periodically for the bet status

URL: GET /api/bets/show?bet_id=#{bet_id}"

returns {"stake": "#{stake}, "price": "#{price}", "description": "#{description}", "settled": "true|false", "status": "won|lost"}

### Operator Requirements

For successful implementation of the TE API, an operator is likely to require the following

- ability and desire to implement their own version of the TE reference iFrame UI
- development personnel with understanding of JSON-over-HTTP protocols and Javascript UI design 
- ability to store TE bets in their local sportsbook, probably under a minimal bet_id/description/stake/price representation
- ability to store and manage TE bet ids; ability to implement tasks to periodically call TE servers for TE bet settlement status etc

### Other

ioSport will provide an web- based admin interface into which operators will be able to login and view details of TE liabilities accumulated, manage margin requirements etc










