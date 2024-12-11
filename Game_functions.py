import random
import SQL_functions
import colors
import connector
import time

def dice_roll(): # iida
    dice = random.randint(1, 6)
    return dice

def income_tax(status): # iida
    money = SQL_functions.get_money(status.session_id)
    temp_money = money
    money -= round(50 + money * 0.25)
    SQL_functions.modify_money(money,status.session_id)
    return f"You have landed on income tax cell. You paid ${temp_money-money}."

def luxury_tax(status): # iida
    money = SQL_functions.get_money(status.session_id)
    temp_money = money
    money -= round(100 + money * 0.5)
    SQL_functions.modify_money(money,status.session_id)
    return f"You have landed on luxury tax cell. You paid ${temp_money-money}."

def print_in_jail_message(status):
    money = SQL_functions.get_money(status.session_id)
    print(f'-------------------------------------------------------------------------')
    print(f'{colors.col.BOLD}{colors.col.YELLOW}You are in jail.', f'{colors.col.END}')
    print(
        f'{colors.col.BOLD}{colors.col.YELLOW}Type "1" to roll the dice and get doubles to get out. You have {3 - status.jail_counter} rolls left until automatic release.',
        f'{colors.col.END}')
    print(f'{colors.col.BOLD}{colors.col.YELLOW}Type "2" to pay a fine of 200 to get out.', f'{colors.col.END}')
    if money <= 200:
        print(f'{colors.col.BOLD}{colors.col.RED}Paying the fine would lead you to bankruptcy.', f'{colors.col.END}')
    print(f'{colors.col.BOLD}{colors.col.YELLOW}Type "3" to use a get out of jail free card to get out.',
          f'{colors.col.END}')
    print(f'-------------------------------------------------------------------------')


def check_if_double(dice_roll_1, dice_roll_2, status):
    if dice_roll_1 == dice_roll_2:
        status.double = True
    elif dice_roll_1 != dice_roll_2:
        status.double = False
    return status.double

def release(status):
    status.jailed = False
    status.jail_counter = 0

def jail_event(status, choice): # iida
    if choice == 'roll':
        dice_roll_1 = dice_roll()
        dice_roll_2 = dice_roll()
        status.rounds += 1
        if status.jail_counter >= 2:
            release(status)
            return True
        else:
            if not check_if_double(dice_roll_1, dice_roll_2, status):
                status.jail_counter += 1
                return False
            else:
                release(status)
                return True
    elif choice == 'pay':
                money = SQL_functions.get_money(status.session_id)
                money -= 200
                SQL_functions.modify_money(money, status.session_id)
                release(status)
                return True
    else:
        if status.jail_card > 0:
            release(status)
            status.jail_card -= 1
            return True
        else:
            return False

def salary(status): # iida
    money = SQL_functions.get_money(status.session_id)
    owned_airport = SQL_functions.get_all_owned_airport(status.session_id,status.username)
    upgraded_airport = SQL_functions.get_upgraded_airport_number(status.session_id)
    temp_money = money
    temp_money += 200 + owned_airport * 10 + upgraded_airport * 25
    SQL_functions.modify_money(temp_money,status.session_id)
    print(f'{colors.col.BOLD}{colors.col.BLUE}You passed Go cell. Salary time! You earned:', f'{temp_money - money:.0f}. Because you owned {owned_airport} airports and upgraded {upgraded_airport} airports' + f'{colors.col.END}')

def buy_airport(status): #yutong
    temp_price = SQL_functions.get_airport_price(status.position)
    temp_money = SQL_functions.get_money(status.session_id) - temp_price
    SQL_functions.modify_money(temp_money,status.session_id)
    SQL_functions.modify_owner_to_user(status)

def sell_airport(status): # roberto
    temp_money = SQL_functions.get_money(status.session_id)
    temp_money = temp_money + (SQL_functions.get_airport_price(status.position) * 0.5)
    SQL_functions.modify_money(temp_money,status.session_id)
    SQL_functions.modify_owner_to_bank(status.position,status.session_id)  

def get_sell_price(status):
    upgrade_level = SQL_functions.get_upgrade_status(status)
    temp_money = SQL_functions.get_money(status.session_id)
    if upgrade_level == 0:
        temp_money = (SQL_functions.get_airport_price(status.position) * 0.5)
        #print(f'Selling this airport will get you ${temp_money}')
    elif upgrade_level == 1:
        temp_money = (SQL_functions.get_airport_price(status.position) * 0.5 * 0.25)
        #print(f'Selling this level will get you ${temp_money}')
    elif upgrade_level == 2:
        temp_money = (SQL_functions.get_airport_price(status.position) * 0.5 * 0.5)
        #print(f'Selling this level will get you ${temp_money}')
    return temp_money

def upgrade_airport(status): # roberto
    temp_price = SQL_functions.get_airport_price(status.position)
    temp_money = SQL_functions.get_money(status.session_id) - 25% temp_price
    SQL_functions.modify_money(temp_money,status.session_id)
    temp_level = 1
    SQL_functions.modify_airport_status(status.position, temp_level,status.session_id)


def price_to_upgrade(status):
    upgrade_level = SQL_functions.get_upgrade_status(status)
    temp_price = SQL_functions.get_airport_price(status.position)
    temp_money =  25% temp_price
    return temp_money

def chance_card(status): # yutong
    card_id = random.randint(1, 10)
    temp_money = SQL_functions.get_money(status.session_id)
    if card_id == 1:
        salary(status)
        status.position = 1
        return 'You picked card: Advance to "Go". You will get $200. Congratulations.'
    elif card_id == 2:
        status.jail_card += 1
        return 'You picked card: Get out of jail. You can use it once when you are in jail.'
    elif card_id == 3:
        status.jailed = True
        status.position = 17
        return 'You picked card: Go to jail. You will be moved to jail immediately.'
    elif card_id == 4:
        temp_money = temp_money + 50
        SQL_functions.modify_money(temp_money,status.session_id)
        return 'You picked card: Bank pays you 50! You will get $50 from the bank, congratulations!'
    elif card_id == 5:
        punishment = SQL_functions.get_all_owned_airport(status.session_id,status.username) * 25 + SQL_functions.get_upgraded_airport_number(status.session_id) * 50
        temp_money = temp_money - punishment
        SQL_functions.modify_money(temp_money,status.session_id)
        return f'You picked card: Pay repair fee for all properties. You need to pay $25 for all airports you own, $50 for all the upgraded airports you own. You need to pay in total ${punishment}.'
    elif card_id == 6:
        temp_money = SQL_functions.get_money(status.session_id) - 50
        SQL_functions.modify_money(temp_money,status.session_id)
        return 'You picked card: Doctor fee. You need to pay $50 to the doctor.'
    elif card_id == 7:
        temp_money = SQL_functions.get_money(status.session_id) + 50
        SQL_functions.modify_money(temp_money,status.session_id)
        return 'You picked card: Grand opening night. You will get $50 from the bank. Congratulations.'
    elif card_id == 8:
        temp_money = SQL_functions.get_money(status.session_id) - 50
        SQL_functions.modify_money(temp_money,status.session_id)
        return 'You picked card: School fee. You need to pay $50 to the school.'
    elif card_id == 9:
        temp_money = SQL_functions.get_money(status.session_id) + 25
        SQL_functions.modify_money(temp_money,status.session_id)
        return 'You picked card: Receive consultancy fee. You will get $25 from the bank. Congratulations.'
    elif card_id == 10:
        temp_money = SQL_functions.get_money(status.session_id) - 50
        SQL_functions.modify_money(temp_money,status.session_id)
        return 'You picked card: Elected as chairman of the board. You need to pay $50 to the bank.'

def bankrupt(session_id):
    print(f'😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵')
    print(f'{colors.col.BOLD}{colors.col.RED}You are bankrupt 💸!  \nGAME OVER', f'{colors.col.END}')
    SQL_functions.clear_tables(session_id)

def developer_privileges(devcheat,status):
    if devcheat == "developer privileges":
        print("Developer mode activated")
        command = input()
        if command == "rounds":
            roundnumber = int(input())
            status.rounds = roundnumber
        elif command == "money":
            moneynumber = int(input())
            SQL_functions.modify_money(moneynumber, status.session_id)
        elif command == "jail":
            status.jailed = True
        elif command == "own_all":
            SQL_functions.cheat_owner_to_user(status)
        elif command == "almighty":
            SQL_functions.modify_money(1000000, status.session_id)
            SQL_functions.cheat_owner_to_user(status)
        elif command == 'end with money':
            temp_money = random.randint(500, 50000)
            SQL_functions.modify_money(temp_money, status.session_id)
            status.rounds = 22
        elif command == 'position':
            status.position = int(input())

def print_player_property(status):
    print(f'{colors.col.BOLD}{colors.col.PINK}━━━━━━━━━━━━━━━━━━━━━{colors.col.END}' + '\n')
    print(f'{colors.col.BOLD}{colors.col.PINK}Round: {status.rounds} | Position: {status.position}{colors.col.END}')
    country_list, airport_number = SQL_functions.get_all_country_name_and_number(status)
    #jail_card = SQL_functions.check_jail_card(status.session_id)
    length = len(country_list)
    money = SQL_functions.get_money(status.session_id)
    print(f'{colors.col.CYAN}---------Player Property---------{colors.col.END}')
    print(f'{colors.col.BOLD}💰Money: {colors.col.CYAN}${money}{colors.col.END}')
    #print(f'🃏Jail card: {colors.col.CYAN}{jail_card}{colors.col.END}')
    if length == 0:
        print(f"{colors.col.BOLD}🛬Properties:{colors.col.CYAN} 0{colors.col.END} {colors.col.END}")
        print(f'{colors.col.CYAN}--------------------------------{colors.col.END}')
    else:
        print(f'{colors.col.BOLD}🛬Properties: {colors.col.END}')
        max_country_length = max(len(country) for country in country_list) + 2
        print(f'{colors.col.BOLD}{"Country":<{max_country_length}} | Number of airports 🛬 owned{colors.col.END}')
        for i in range(length):
            print(f'{colors.col.CYAN}{country_list[i]:<{max_country_length}} | {airport_number[i]}{colors.col.END}')
        print(f'{colors.col.CYAN}--------------------------------{colors.col.END}')

def print_won_game(status):
    money = SQL_functions.get_money(status.session_id)
    airport = SQL_functions.get_all_owned_airport(status.session_id, status.username)
    upgrade_airport_number = SQL_functions.get_upgraded_airport_number(status.session_id)
    status.score = round(money + airport * 5 + upgrade_airport_number * 10)

def print_high_score(status):
    SQL_functions.insert_high_score(status.session_id, status.score)
    top_player, top_score, session_list = SQL_functions.get_top_high_score()
    SQL_functions.clear_tables(status.session_id)
    return top_player, top_score, session_list

def go_to_jail(status):
    status.jailed = True
    status.position = 17

def dice_roll_result(dice_roll_1,dice_roll_2,status):
    print(f'You rolled 🎲:', f'{dice_roll_1}, {dice_roll_2}', f'| {colors.col.PINK}You moved to cell number:',f'{status.position}{colors.col.END}')

def rounds_up(status):
    print(f'You finished one round of the game. Now rounds + 1. Position starts from 0.')
    status.rounds += 1
    status.position = status.position - 21

def check_airport_cell(status):
    owner = SQL_functions.check_airport_owner(status)
    temp_money = SQL_functions.get_money(status.session_id)
    airport_price = SQL_functions.get_airport_price(status.position)

    if owner == status.username:
        upgrade_level = SQL_functions.get_upgrade_status(status)
        if upgrade_level == 1:
            return "ownedupgraded"
        upgradeable = SQL_functions.check_owns_all_of_country(status)
        if upgradeable and (price_to_upgrade(status) < temp_money):
            return "ownedyes"
        else:
            return "ownedno"
    elif owner == "bank":
        rent = airport_price * 0.5
        temp_money = temp_money - rent
        SQL_functions.modify_money(temp_money, status.session_id)
        return "bank"
    else:
        if temp_money > airport_price:
            return "noyes"
        else:
            return "nono"


def airport_cell(status, param):
    airport_price = SQL_functions.get_airport_price(status.position)
    country_name = SQL_functions.get_country_name(status)
    airport_name = SQL_functions.get_airport_name(status)
    temp_money = SQL_functions.get_money(status.session_id)
    owner = SQL_functions.check_airport_owner(status)
    
    if param == "buy":
        buy_airport(status)
    if param == "sell":
        sell_airport(status)
    if param == "upgrade":
        upgrade_airport(status)

def roll_and_move(status):
    dice_roll_1 = random.randint(1, 6)
    dice_roll_2 = random.randint(1, 6)
    status.position += dice_roll_1 + dice_roll_2
    if status.position > 22:
        rounds_up(status)
    return dice_roll_1,dice_roll_2,status

def check_username(status):
    if status.username == '':
        print('Username cannot be empty.')
    elif status.username == 'bank':
        print('Username cannot be "bank"')
    else:
        SQL_functions.insert_username(status.username, connector.get_start_time())
        status.session_id = SQL_functions.get_session_id()
    print(f'Username confirmed as {status.username}, session id = {status.session_id}')