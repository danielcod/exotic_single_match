from controllers.api.single_match import *

# curl -H "Content-Type: application/json" -X POST "http://localhost:8080/api/single_match/bets/price" -d "{\"selection\": {\"winners_criteria\":1 , \"xs_criteria\": 1, \"bhxs_criteria\": null, \"ehxs_criteria\": null, \"ones_criteria\": null, \"bhones_criteria\": null, \"ehones_criteria\": null, \"twos_criteria\": null, \"bhtwos_criteria\": null, \"ehtwos_criteria\": null, \"btts_criteria\": null, \"btts_both_halves_criteria\": null, \"btts_either_half_criteria\": null, \"total_goals_criteria\": null, \"home_goal_scorer_criteria\": null, \"first_goal_scorer_in_match_home_selections_criteria\": null, \"first_home_goal_scorer_criteria\":[\"286119\"],  \"home_hattrick_criteria\": null, \"away_goal_scorer_criteria\": null, \"first_goal_scorer_in_match_away_selections_criteria\": null, \"first_away_goal_scorer_criteria\": null, \"away_hattrick_criteria\": null, \"home_corners_criteria\": null, \"away_corners_criteria\": null, \"match_total_corners_criteria\": null, \"both_teams_corners_criteria\": null, \"lower_number_of_goals_criteria\": null, \"upper_number_of_goals_criteria\": null, \"home_booking_points_criteria\": null, \"away_booking_points_criteria\": null, \"total_booking_points_criteria\": null, \"both_teams_booking_points_criteria\": null, \"home_player_card_criteria\":null , \"first_player_in_match_booked_home_selections_criteria\": null, \"first_home_player_booked_criteria\": null, \"home_player_reds_criteria\": null, \"away_player_card_criteria\": null, \"first_player_in_match_booked_away_selections_criteria\": null, \"first_away_player_booked_criteria\": null, \"away_player_reds_criteria\": null}, \"iD\": \"2522816\"}"

class PriceHandler(webapp2.RequestHandler):
    
    @parse_json_body
    # @add_cors_headers
    @emit_json
    def post(self, bet):
        from google.appengine.api import urlfetch
        print json_dumps(bet)
        args={"method": "POST",
              "url": "https://pricer-dot-exotic-parameter-predictions.appspot.com/price_game",
              "payload": json.dumps(bet),
              "headers": {"Content-Type": "application/json"},
              "deadline": 30}
        return urlfetch.fetch(**args).content
        
Routing=[('/api/single_match/bets/price', PriceHandler)]

app=webapp2.WSGIApplication(Routing)

