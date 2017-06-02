### Overview

The Team Exotics ('TE') API is a service which facilitates operators in the pricing, tracking and settlement of TE- style bets (defined below), designed and entered into by their respective customers.

A TE bet is loosely defined as incorporating one or more of the following elements - 

- a underlying single bet or collection of single bets on standard 'goals based' events (football: match winner, correct score, goals scored etc) or a more 'exotic' event (football: cards, corners, goalscorers etc)
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

A smaller number of customers are likely to place bets. The TE API provides a number of actions which allow an operator to track a bet and get description and settlement details for the exchange of a simple bet token (see below).

# Bet Tokens

The key concept behind the API is of the 'bet token'; essentially a reference to a bet created on the TE servers. This bet may be a product which has been created in Guest Mode but has yet to be placed, or may be a product in Bet Mode which a customer has placed with a stake. Either way, the operator can pass the bet token to one of the TE API calls and in return receive a description, a price and settlement information for that bet.

### API Design

The API will designed using the standard JSON-over-HTTPS pattern.

Authentication will be implemented using the standard API key / cookie pattern.

### Authentication

Operators will need to authenticate with the TE API. It is likely that ioSport will assign each operator a unique TE API key. Initial connection with the API will require a call to the following URL

POST /api/login "api_key=#{APIKey}"

returns {"status": "ok|error", "message": "#{message}"}

Upon successful login the TE server will reply with a standard HTTP[S] authentication cookie which must be used for successful completion of subsequent API calls.

It is likely that authetication cookie will expire after a fixed time (probably 1hr) requiring periodic re- authentication

### Guest Mode actions

### Bet Mode actions

# Placing Bet

Every TE bet created in Guest Mode will be assigned a bet token. When a user is ready to create, a call to the following URL must be made to 'create' the bet on the TE servers, which will initialise the bet for lifecycle tracking and subsequent settlement

URL: POST /api/bets/create "bet_token=#{bet_token}&stake=#{stake}"

returns: {"status": "ok|error", "message": "#{message}"

# Bet Description/Status

The operator will need to call the TE servers to get a description of the bet, and to periodically check settlement status

URL: GET /api/bets/show?bet_token=#{bet_token}"

returns {"stake": "#{stake}, "price": "#{price}", "description": "#{description}", "settled": "true|false", "status": "won|lost"}

### Operator Requirements

For successful implementation of the TE API, an operator is likely to require the following

- ability and desire to implement their own version of the TE reference iFrame UI
- development personnel with understanding of JSON-over-HTTP protocols and Javascript UI design 
- ability to store TE bets in their local sportsbook, probably under a minimal bet_token/description/stake/price representation
- ability to store and manage TE bet tokens; ability to implement tasks to periodically call TE servers for TE bet settlement status etc

### Other

ioSport will provide an web- based admin interface into which operators will be able to login and view details of TE liabilities accumulated, manage margin requirements etc










