'use strict';

// temp
let player = {location: 1, money: 0}
let username = '';
let localsessionid = '';

const startform = document.querySelector('#start-game');
const statustext = document.querySelector('#status');

const playerimg = 'img/player.png'

if (localsessionid !== '' && localsessionid !== null){
	nukeform.style.display = 'block';
	loadform.style.display = 'block';
}

// sets player icon onto go space
document.querySelector('[id="cell_1_player"]').src = playerimg;

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
        document.querySelector('#player-money').innerHTML = `money: ${money}`;
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
    player.location = 17;
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
    document.querySelector('#roll-value').innerHTML = `you rolled: ${roll}`;
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
		let total = jsonData["total"]

        if (startposition != 17){
            document.querySelector(`[id="cell_${startposition}_player"]`).src = 'img/empty_image_dumb.png';
        } else {
            document.querySelector(`[id="cell_17_player"]`).src = 'img/ironbar.png';
        }
        document.querySelector(`[id="cell_${endposition}_player"]`).src = playerimg;

		document.querySelector('#roll-value').innerHTML = `you rolled: ${total}`

        let currentround = document.querySelector('#current-round');
        let tempRound = parseInt(currentround.innerHTML);
        if (jsonData["round"] != tempRound){
            currentround.innerHTML = jsonData["round"]
        }
    } catch (error){
        console.log(error);
    }
}

// new game :)
startform.addEventListener('submit', async function(event){
    event.preventDefault();

    username = document.querySelector('input[name=username]').value;
    if (username !== ''){
        try{
            const response = await fetch(`http://127.0.0.1:5000/gameapi/start/${username}`,{
				credentials: 'include'
			});
            const jsonData = await response.json();
			console.log(jsonData.session_id)
			localsessionid = jsonData.session_id;
			localStorage.setItem('session_id', localsessionid);
            startGame();
        } catch (error){
            console.log(error);
            document.querySelector('#start-info').innerHTML = `something went wrong. info: ${error}`;
        }
    } else{
            document.querySelector('#start-info').innerHTML = 'please enter an username';
    }
});

statustext.addEventListener('click', async function(event) {
	try{
		const response = await fetch('http://127.0.0.1:5000/gameapi/play',{
				credentials: 'include'
			  });
		const jsonData = await response.json();
		console.log(jsonData);
	} catch (error){
		console.log(error);
	}
});

let playbutton = document.querySelector('#play-button');
playbutton.addEventListener('click', movePlayer);

// test for movement
//playbutton.addEventListener('click', (event) => advancePlayer(diceRoll()));