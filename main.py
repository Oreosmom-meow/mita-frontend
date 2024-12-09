import SQL_functions
import Game_functions
import colors
import connector
import json
from flask import Flask, Response, session
from flask_cors import CORS

# class
class GameState:
    def __init__(self):
        self.rounds = 1
        self.doubles = 0
        self.jail_card = 0
        self.jail_counter = 0
        self.jailed = False
        self.username = ''
        self.position = 0
        self.session_id = 0
        self.score = 0
# get connection time
connector.print_connection_time()

# GAME SETUP USING FLASK SESSIONS, START CREATES THE SESSION, PLAY SHOWS HOW TO RE-INITIALIZE SESSION WHEN DOING ANY FUNCTION
app = Flask(__name__)
app.secret_key = "secret key"
CORS(app, supports_credentials=True)
app.config.update({
    'SESSION_COOKIE_SECURE': False,          # Set True for HTTPS
    'SESSION_COOKIE_DOMAIN': '127.0.0.1',
    'SESSION_COOKIE_PATH': '/',

})
@app.route('/gameapi/start/<username>')
def start(username):
    status = GameState()
    status.username = username
    Game_functions.check_username(status)

    #set up session specific board
    SQL_functions.set_board_airports(status.session_id)
    SQL_functions.set_player_property(status.session_id)

    session['game_state'] = {
        "rounds": status.rounds,
        "doubles": status.doubles,
        "jail_card": status.jail_card,
        "jail_counter": status.jail_counter,
        "jailed": status.jailed,
        "username": status.username,
        "position": status.position,
        "session_id": status.session_id,
        "score": status.score
    }
    return {
		"session_id": status.session_id,
		"status": 200
	}
@app.route('/gameapi/play')
def play():
    # game state session, dont touch
    game_state = session.get('game_state')
    status = GameState()
    for thing, value in game_state.items():
        setattr(status, thing, value)
    # code here:
    return {"session_id":status.session_id}

@app.route('/gameapi/board')
def board():
    # game state session, dont touch
    game_state = session.get('game_state')
    status = GameState()
    for thing, value in game_state.items():
        setattr(status, thing, value)
    # code here:
    board_airports = SQL_functions.get_airports_while_dreaming(status.session_id)
    return board_airports


@app.errorhandler(404)
def page_not_found(error_code):
    response = {
        "message": "Invalid endpoint",
        "status": 404
    }
    json_response = json.dumps(response)
    http_response = Response(response=json_response, status=404, mimetype="application/json")
    return http_response

if __name__ == '__main__':
    app.run(use_reloader=True, host='127.0.0.1', port=5000)

#old main vvvvvvvv

# position move and rounds up
# while status.rounds <= 20:
#     money = SQL_functions.get_money(status.session_id)
#     if money <= 0:
#         Game_functions.bankrupt(status.session_id)
#         break
#     else:
#         if status.jailed:
#             Game_functions.jail_event(status)
#         else:
#             Game_functions.print_player_property(status)
#             userinput = input(f'{colors.col.BOLD}Roll the dice 🎲 to move. Press any key to roll. {colors.col.END}')
#             Game_functions.developer_privileges(userinput, status)
#             dice_roll_1,dice_roll_2,status = Game_functions.roll_and_move(status)
#             Game_functions.dice_roll_result(dice_roll_1, dice_roll_2, status)
#             if Game_functions.check_if_double(dice_roll_1, dice_roll_2, status):
#                 status.doubles += 1
#             else:
#                 if status.doubles >= 2:
#                     Game_functions.roll_double(status)
#                     Game_functions.jail_event(status)
#                 else:
#                     status.doubles = 0
#                     temp_type_id = SQL_functions.get_type_id(status.position)
#                     # Non-functional cells
#                     if temp_type_id == 0:
#                         Game_functions.non_functional_cell(status)
#                     # airport cell
#                     elif temp_type_id == 1:
#                         Game_functions.airport_cell(status)
#                     # Other cells
#                     elif temp_type_id == 2:
#                         Game_functions.chance_card(status)
#                     elif temp_type_id == 3:
#                         Game_functions.go_to_jail(status)
#                     elif temp_type_id == 4:
#                         Game_functions.income_tax(status.session_id)
#                     elif temp_type_id == 5:
#                         Game_functions.luxury_tax(status.session_id)
#wininig of game
