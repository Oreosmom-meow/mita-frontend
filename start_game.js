'use strict';
const startform = document.querySelector('#start-game');
const statustext = document.querySelector('#status');

const playerimg = 'img/player.png'

async function makeBoard(){
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

        document.querySelector('#player-money').innerHTML = `Money: ${money}`;
    } catch (error){
        console.log(error);
    }}

function startGame(){
	// actually start game
    makeBoard();
	
	document.querySelector('dialog').close();
}

// temp, hopefully. puts player in jail.
function jailProceedings(){
    document.querySelector(`[id="cell_17_player"]`).src = 'img/cat_jail.png';
    document.querySelector('#action-window').style.display = 'none';
    document.querySelector('#jail-window').style.display = 'block';

	// get out of jail, free
    document.querySelector('#jail-card-button').addEventListener('click', (event) => {
        document.querySelector(`[id="cell_17_player"]`).src = playerimg;
        document.querySelector('#jail-window').style.display = 'none';
        document.querySelector('#action-window').style.display = 'block';
        })
}

// rolls the dice
// actual roll should be in the flask
function diceRoll(){
    let roll = (Math.floor(Math.random()*6) + 1) + (Math.floor(Math.random()*6) + 1);
    document.querySelector('#roll-value').innerHTML = `Dice rolled:: ${roll}`;
    return roll;
}

async function movePlayer(){
    try{
        const response = await fetch(`http://127.0.0.1:5000/gameapi/move`,{
            credentials: 'include'
        });
        let jsonData = await response.json();
        console.log(jsonData);
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

		document.querySelector('#player-money').innerHTML = `Money: ${money}`;

		let id = jsonData["id"];
	console.log(id);

		switch(id){
			case 'ownedupgraded':
				// todo: sell upgrade
				break;
			case 'ownedyes':
				// make upgrade and sell buttons visible
				break;
			case 'ownedno':
				// make sell button visible
				break;
			case 'nono':
				break;
			case 'noyes':
				/////// make buy button visible
				//document.querySelector('#buy-button').style.display = 'block';
				
				break;
			case 'bank':
				break;
			case 1:
				statustext.innerHTML = 'You picked card: Advance to "Go". You will get $200. Congratulations.';
				break;
			case 2:
				statustext.innerHTML = 'You picked card: Get out of jail. You can use it once when you are in jail.';
				break;
			case 3:
				statustext.innerHTML = 'You picked card: Go to jail. You will be moved to jail immediately.';
				break;
			case 4:
				statustext.innerHTML = 'You picked card: Bank pays you 50! You will get $50 from the bank, congratulations!';
				break;
			case 5:
				statustext.innerHTML = `You picked card: Pay repair fee for all properties. You need to pay $25 for all airports you own, $50 for all the upgraded airports you own. You need to pay in total ${start_money-end_money}.`
				break;
			case 6:
				statustext.innerHTML = 'You picked card: Doctor fee. You need to pay $50 to the doctor.';
				break;
			case 7:
				statustext.innerHTML = 'You picked card: Grand opening night. You will get $50 from the bank. Congratulations.';
				break;
			case 8:
				statustext.innerHTML = 'You picked card: School fee. You need to pay $50 to the school.';
				break;
			case 9:
				statustext.innerHTML = 'You picked card: Receive consultancy fee. You will get $25 from the bank. Congratulations.';
				break;
			case 10:
				statustext.innerHTML = 'You picked card: Elected as chairman of the board. You need to pay $50 to the bank.';
				break;
			case 'income_tax':
				statustext.innerHTML = `You have landed on income tax cell. You paid ${start_money-end_money}`;
				break;
			case 'luxury_tax':
				statustext.innerHTML = `You have landed on luxury tax cell. You paid ${start_money-end_money}`;
				break;
			case 'jail':
				jailProceedings();
				break;

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