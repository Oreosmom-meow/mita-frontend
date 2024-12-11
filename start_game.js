'use strict';
const startform = document.querySelector('#start-game');
const statustext = document.querySelector('#status');

document.querySelector('#upgrade-button').addEventListener('click', upgradeAirport);
document.querySelector('#sell-button').addEventListener('click', sellAirport);
document.querySelector('#buy-button').addEventListener('click', buyAirport);
document.querySelector('#jail-dice-button').addEventListener('click', (event) => jailAction("roll"));
document.querySelector('#jail-money-button').addEventListener('click', (event) => jailAction("pay"));
document.querySelector('#jail-card-button').addEventListener('click', (event) => jailAction("card"));

const playerimg = 'img/player.png' 

function updateMoney(money){
	document.querySelector('#player-money').innerHTML = `Money: ${money}`;
}

async function jailAction(action) {
	try{
        const response = await fetch(`http://127.0.0.1:5000/gameapi/jail/${action}`,{
            credentials: 'include'
        });
		const jsonData = await response.json();
		let money = jsonData["money"];
		let release = jsonData["release"];
		let jail_counter = jsonData["jail_counter"];
		let jailcards = jsonData["jailcards"];

		document.querySelector('#times-rolled').innerHTML = `You have rolled ${jail_counter} times.`;

		if (release){
			document.querySelector(`[id="cell_17_player"]`).src = 'img/player.png';
			document.querySelector('#action-window').style.display = 'block';
			document.querySelector('#jail-window').style.display = 'none';
			updateMoney(money);
			document.querySelector('#jail-cards').innerHTML = `Jail cards: ${jailcards}`;
			document.querySelector('#jail-cards-jail').innerHTML = `Jail cards: ${jailcards}`;
		}
    } catch (error){
        console.log(error);
    }
}

async function makeBoard(){
	hideButtons();

    try{
        const response = await fetch(`http://127.0.0.1:5000/gameapi/board`,{
            credentials: 'include'
        });
        let jsonData = await response.json();
        let airportArray = jsonData["airport_array"];
        let money = jsonData["money"];
        for (let airport of airportArray){
            let airport_text = document.querySelector(`[id='cell_${airport.board_id}_text']`);
            airport_text.innerHTML = `${airport.name}<br>Price: ${airport.price}`;
        }
		let bankArray = jsonData["bank_array"];
		for (let airport of bankArray){
			let bank_owned = document.querySelector(`[id='cell_${airport[0]}_slot2']`);
			bank_owned.src = 'img/bank_owned.png'
		}

        updateMoney(money);
    } catch (error){
        console.log(error);
    }}

function startGame(){
	// actually start game
    makeBoard();
	
	document.querySelector('dialog').close();
}

function hideButtons(){
	document.querySelector('#upgrade-button').style.display = 'none';
	document.querySelector('#sell-button').style.display = 'none';
	document.querySelector('#buy-button').style.display = 'none';
}

// temp, hopefully. puts player in jail.
function jailProceedings(money, cards){
	document.querySelector('#jail-cash').style.display = 'none';
	document.querySelector('#jail-card').style.display = 'none';
    document.querySelector(`[id="cell_17_player"]`).src = 'img/cat_jail.png';
    document.querySelector('#action-window').style.display = 'none';
    document.querySelector('#jail-window').style.display = 'block';
	document.querySelector('#jail-money-counter').innerHTML = `Money: ${money}`;
	document.querySelector('#times-rolled').innerHTML = 'You have rolled 0 times.';

	if (money > 200){
		document.querySelector('#jail-cash').style.display = 'block';
	}
	if (cards > 0){
		document.querySelector('#jail-card').style.display = 'block';
	}
}

async function movePlayer(){
	statustext.innerHTML = '';
	hideButtons();
    try{
        const response = await fetch(`http://127.0.0.1:5000/gameapi/move`,{
            credentials: 'include'
        });
        let jsonData = await response.json();
        let startposition = jsonData["start_position"];
        let endposition = jsonData["end_position"];
		let total = jsonData["total"];

        if (startposition != 17){
            document.querySelector(`[id="cell_${startposition}_player"]`).src = 'img/empty_image_dumb.png';
        } else {
            document.querySelector(`[id="cell_17_player"]`).src = 'img/ironbar.png';
        }
        document.querySelector(`[id="cell_${endposition}_player"]`).src = playerimg;

		document.querySelector('#roll-value').innerHTML = `Dice rolled: ${total}`;

        let currentround = document.querySelector('#current-round');
        let tempRound = parseInt(currentround.innerHTML);
        if (jsonData["round"] != tempRound){
            currentround.innerHTML = jsonData["round"];
        }

		let start_money = jsonData["start_money"];
		let end_money = jsonData["end_money"];
		let money = jsonData["money"];
		let jailcards = jsonData["jailcard"];
		document.querySelector('#jail-cards').innerHTML = `Jail cards: ${jailcards}`;
		document.querySelector('#jail-cards-jail').innerHTML = `Jail cards: ${jailcards}`;
		updateMoney(money);

		let id = jsonData["id"];

		switch(id){
			case 'ownedupgraded':
				// todo: sell upgrade
				break;
			case 'ownedyes':
				// make upgrade and sell buttons visible
				document.querySelector('#upgrade-button').style.display = 'block';
				document.querySelector('#sell-button').style.display = 'block';
				break;
			case 'ownedno':
				document.querySelector('#sell-button').style.display = 'block';
				break;
			case 'nono':
				break;
			case 'noyes':
				document.querySelector('#buy-button').style.display = 'block';
				break;
			case 'bank':
				break;
			case 'event':
				statustext.innerHTML = jsonData["eventmsg"];
				break;
			case 'jail':
				jailProceedings(money, jailcards);
				break;
			case 'win':
				document.querySelector('#action-window').style.display = 'none';
				document.querySelector('#bankrupt').style.display = 'none';
				hideButtons();
				document.querySelector('#play-button').style.display = 'none';
				document.querySelector('#winning').style.display = 'block';
				document.querySelector('#score').innerHTML = `You scored: ${jsonData["score"]} points!`;
				break;
			case 'bankrupt':
				document.querySelector('#action-window').style.display = 'none';
				document.querySelector('#bankrupt').style.display = 'block';
				hideButtons();
				document.querySelector('#play-button').style.display = 'none';
			}
    } catch (error){
        console.log(error);
    }
}

async function upgradeAirport(){
	try{
        const response = await fetch(`http://127.0.0.1:5000/gameapi/tori/upgrade`,{
            credentials: 'include'
        });
        let jsonData = await response.json();
		document.querySelector('#upgrade-button').style.display = 'none';
		document.querySelector('#sell-button').style.display = 'none';
		document.querySelector(`#cell_${jsonData['position']}_slot2`).src = 'img/owned_upgraded.png';
		document.querySelector('#player-money').innerHTML = `Money: ${jsonData['money']}`;

    } catch (error){
        console.log(error);
    }
}

async function buyAirport(){
	try{
        const response = await fetch(`http://127.0.0.1:5000/gameapi/tori/buy`,{
            credentials: 'include'
        });
        let jsonData = await response.json();
		document.querySelector('#buy-button').style.display = 'none';
		document.querySelector(`#cell_${jsonData['position']}_slot2`).src = 'img/owned.png';
		document.querySelector('#player-money').innerHTML = `Money: ${jsonData['money']}`;

    } catch (error){
        console.log(error);
    }
}

async function sellAirport(){
	try{
        const response = await fetch(`http://127.0.0.1:5000/gameapi/tori/sell`,{
            credentials: 'include'
        });
        let jsonData = await response.json();
		document.querySelector('#upgrade-button').style.display = 'none';
		document.querySelector('#sell-button').style.display = 'none';
		document.querySelector(`#cell_${jsonData['position']}_slot2`).src = 'img/bank_owned.png';
		document.querySelector('#player-money').innerHTML = `Money: ${jsonData['money']}`;

    } catch (error){
        console.log(error);
    }
}

// new game :)
startform.addEventListener('submit', async function(event){
    event.preventDefault();

    let username = document.querySelector('input[name=username]').value;
    if (username !== ''){
        try{
            const response = await fetch(`http://127.0.0.1:5000/gameapi/start/${username}`,{
				credentials: 'include'
			});
            const jsonData = await response.json();
			console.log(jsonData.session_id)
            startGame();
        } catch (error){
            console.log(error);
            document.querySelector('#start-info').innerHTML = `something went wrong. info: ${error}`;
        }
    } else{
            document.querySelector('#start-info').innerHTML = 'please enter an username';
    }
});

let playbutton = document.querySelector('#play-button');
playbutton.addEventListener('click', movePlayer);