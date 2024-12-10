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

list = get_airports_while_dreaming(1448)
print(list[0])

