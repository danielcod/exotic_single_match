### app.js
# App
- the App class is the top level component in the application, and contains configuration of the different 'products' to be passed to the AccaProductPanel; see the 'products' argument passed to the AccaProductPanel contructor
# Main
- creates an instance of App and binds to the underlying page
### date_utils.js
# DateUtils
- some simple date utilities (non- React)
# DateTimeCell
- a class to render a date as a label (possibly no longer used)
### exotic_acca.js
- exotic_acca.js contains the main part of the code for the app
- essentially the idea is that this panel can be 'configured' with different product types, which are selectable using the main 'Product' selector
# AccaPanelTabs
- manages Product Tabs ('Your Bet', 'Select Legs')
# AccaLegRow
- renders a single bet leg; shows selection description, price; has a 'cancel' button to remove the leg from the bet
# AccaLegTable
- table showing number of legs in a bet; when a row from 'Leg Selector' is clicked on, that row is added as a 'leg' to this bet table
# AccaNLegsToggle
- a component to select the number of legs that must win in the bet
- is initially configured by data passed from App, on a product- specific basis; but has a dynamic maximum value equal to the number of rows in AccaLegTable
# AccaNGoalsSlider
- a component which allows you to select a value for the minimum number of goals each team must win
- is configured by data passed from the App, on a product- specific basis
# AccaProductPanel
- the main product panel, containing top- level product selector, product price, list of bet legs, 'number of goals' slider and 'number of legs' toggle
### match_teams.js
- match_teams.js is a collection of components for managing the selection of teams on the 'Leg Selector' panel
- it only appears for "Exotic Acca Winner" and "Exotic Acca Loser" products, where you are concerned with selecting *teams* from upcoming matches, as opposed to the matches themselves
- for "Exotic Acca Draws", components from matches.js are used instead (see below)
- if you select "Exotic Acca Winner" as 'Product' and click 'Leg Selector', you will be shown a MatchTeamPanel
- the three prices shown in each row are for home win, draw and away win; click the left column ('home win') and the home team is selected; ditto the right column ('away win'); the center column ('draw') is not selectable
- when you select a team it is entered as a row in the bet table (see 'Your Bet' table)
- double-clicking will removed the team from the bet leg table
# MatchTeamToggleCell
- is a special 'clickable' <td> class which handles the on/off selection toggling for a given price
# MatchTeamRow
- renders a single <tr> in MatchTeamTable; match name, home win/draw/away win prices
# MatchTeamTable
- renders a <table> element showing the list of matches for the currently selected league
# MatchTeamPanel
- main table rendering panel
- is created with a list of matches from multiple leagues
- filters unique league names and renders a select at the top of the panel
- only shows matches which belong to the currently- selected league
- manages clicking of home/away teams; when a team is selected/unselected, the change in selection is passed to the main Acca Table/Panel
### matches.js
- components in matches.js are very similar to those in match_teams.js except they are concerned with the selection of matches rather than teams
- if you select "Exotic Acca Draws" as 'Product' and click 'Leg Selector', you will be shown a MatchPanel
- the three prices shown in each row are for home win, draw and away win; click the center column ('draw') and the match is selected; the home/away win columns are not selectable
- when you select a match it is entered as a row in the bet table (see 'Your Bet' table)
- double-clicking will removed the match from the bet leg table
# MatchToggleCell
# MatchRow
# MatchTable
# MatchPanel
### services.js
- services.js is concerned solely with wrapping HTTP/JSON calls to the API server
# ExoticsAPI
- a class managing HTTP/JSON API calls to the Python server
### table_utils.js
- some generic table utilities
# MyPaginator
- a generic table paginator class