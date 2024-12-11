import SQL_functions
import Game_functions
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

# set session game status?
def setStatus(status):
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

# GAME SETUP USING FLASK SESSIONS, START CREATES THE SESSION, PLAY SHOWS HOW TO RE-INITIALIZE SESSION WHEN DOING ANY FUNCTION
app = Flask(__name__)
app.secret_key = "secret key"
CORS(app, supports_credentials=True)
app.config.update({
    'SESSION_COOKIE_SECURE': False,
    'SESSION_COOKIE_DOMAIN': '127.0.0.1',
    'SESSION_COOKIE_PATH': '/',
    'SESSION_COOKIE_SAMESITE': 'lax',
})

@app.route('/gameapi/start/<username>')
def start(username):
    try:
        status = GameState()
        status.username = username
        status.position = 1
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
    except:
        response = {
            "status": 400
        }
        return response

@app.route('/gameapi/board')
def board():
    # game state session, dont touch
    game_state = session.get('game_state')
    status = GameState()
    for thing, value in game_state.items():
        setattr(status, thing, value)
    # code here:
    try:
        board_airports = SQL_functions.get_airports_while_dreaming(status.session_id)
        bank_airports = SQL_functions.get_all_bank_owned_airport(status.session_id)
        money = SQL_functions.get_money(status.session_id)
        response = {
            "airport_array": board_airports,
            "bank_array": bank_airports,
            "money": money,
            "status": 200
        }
        return response
    except:
        response = {
            "status": 400
        }
        return response


@app.route('/gameapi/tori/<param>')
def tori(param):
    # game state session, dont touch
    game_state = session.get('game_state')
    status = GameState()
    for thing, value in game_state.items():
        setattr(status, thing, value)
    # code here:
    try:
        Game_functions.airport_cell(status, param)

        response = {
            "money": SQL_functions.get_money(status.session_id),
            "position": status.position
        }
        setStatus(status)

        return response
    except:
        response = {
            "status": 400
        }
        return response

@app.route('/gameapi/jail/<param>')
def jail(param):
    # game state session, dont touch
    game_state = session.get('game_state')
    status = GameState()
    for thing, value in game_state.items():
        setattr(status, thing, value)
    # code here:
    try:
        release = Game_functions.jail_event(status, param)

        response = {
            "money": SQL_functions.get_money(status.session_id),
            "release": release,
            "jail_counter": status.jail_counter,
            "jailcards": status.jail_card
        }
        setStatus(status)

        return response
    except:
        response = {
            "status": 400
        }
        return response

##### THIS BASICALLY HANDLES GAMEPLAY, SAME AS MAIN GAME FUNCTION !!!!!!!
@app.route('/gameapi/move')
def move():
    # game state session, dont touch
    game_state = session.get('game_state')
    status = GameState()
    for thing, value in game_state.items():
        setattr(status, thing, value)
    # code here:
    try:
        eventmsg = ''
        start_position = status.position
        start_money = SQL_functions.get_money(status.session_id)
        oldrounds = status.rounds
        r1, r2, status = Game_functions.roll_and_move(status)
        newrounds = status.rounds
        total = r1 + r2

        if newrounds > oldrounds:
            Game_functions.salary(status)

        if Game_functions.check_if_double(r1, r2, status):
            status.doubles += 1
        else:
            status.doubles = 0

        if status.doubles >= 2:
            status.jailed = True
            status.position = 17
            status.doubles = 0
        else:
            temp_type_id = SQL_functions.get_type_id(status.position)
            # airport cell
            if temp_type_id == 1:
                id = Game_functions.check_airport_cell(status)
            # Other cells
            elif temp_type_id == 2:
                id = 'event' 
                eventmsg = Game_functions.chance_card(status)
            elif temp_type_id == 3:
                id = Game_functions.go_to_jail(status)
            elif temp_type_id == 4:
                id = 'event'
                eventmsg = Game_functions.income_tax(status)
            elif temp_type_id == 5:
                id = 'event'
                eventmsg = Game_functions.luxury_tax(status)
            else:
                id = 0

        end_money = SQL_functions.get_money(status.session_id)

        if SQL_functions.get_money(status.session_id) <= 0:
            id = "bankrupt"

        if status.jailed:
            id = "jail"

        if status.rounds > 20:
            id = "win"
            Game_functions.print_won_game(status)

        response = {
            "score": status.score,
            "eventmsg": eventmsg,
            "start_money": start_money,
            "end_money": end_money,
            "money": SQL_functions.get_money(status.session_id),
            "id": id,
            "total": total,
            "start_position": start_position,
            "end_position": status.position,
            "round": status.rounds,
            "jailcard": status.jail_card
        }
        setStatus(status)
        return response
    except:
        response = {
            "status": 400
        }
        return response


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
