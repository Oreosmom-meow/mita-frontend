import connector
import time
def get_airports_while_dreaming(session_id): #ChatGPT
	airportnumbers = (2, 4, 5, 7, 8, 10, 13, 15, 16, 19, 20, 21)
	airports = []
	sql = f"select a.name, b.price from player_property pp join airport a on pp.airport_id = a.ident join board b on pp.board_id = b.board_id where pp.session_id = {session_id};"
	cursor = connector.connection.cursor()
	cursor.execute(sql)
	result = cursor.fetchall()
	for i in range(0,12):
		thing = {
			"board_id": airportnumbers[i],
			"name": result[i][0],
			"price": result[i][1]
		}
		airports.append(thing)
	return airports

def set_board_airports(session_id):
	airportnumbers = (2,4,5,7,8,10,13,15,16,19,20,21)
	i = 0
	start = time.time()
	success = False
	while not success:
		counter = 0
		country_sql = f'SELECT DISTINCT iso_country FROM airport GROUP BY iso_country HAVING COUNT(*) >= 3 ORDER BY RAND() LIMIT 4;'
		cursor = connector.connection.cursor()
		cursor.execute(country_sql)
		country_result = cursor.fetchall()
		for row in country_result:
			airport_sql = f'SELECT DISTINCT ident FROM airport WHERE iso_country = "{row[0]}" AND LENGTH(name) < 30 ORDER BY RAND() LIMIT 3;'
			cursor = connector.connection.cursor()
			cursor.execute(airport_sql)
			airport_result = cursor.fetchall()
			print(airport_result)
			if len(airport_result) == 3:
				counter += 1
		if counter == 4:
			success = True
	print("inserted :)")
	
	end = time.time()
	print(f"Game database set up in {end - start} seconds.")
	return

set_board_airports(1539)


