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


function startGame(session_id){
	// actually start game

	
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

// moves the player icon forward and handles putting them into jail
// should move actual logic to flask and only use this for movement?
// or handle all movement in flask and just use returned values to move player separately?
function advancePlayer(step){
    let currentlocation = player.location;
    let oldlocation = currentlocation;
    currentlocation += step;
    if (currentlocation > 22){
        let round = parseInt(document.querySelector('[id="current-round"]').innerHTML);
        round++;
        document.querySelector('[id="current-round"]').innerHTML = round;
        currentlocation -= 22;
    }
    player.location = currentlocation;


    
    if (oldlocation != 17){
        document.querySelector(`[id="cell_${oldlocation}_player"]`).src = 'img/empty_image_dumb.png';
    } else {
        document.querySelector(`[id="cell_17_player"]`).src = 'img/ironbar.png';
    }


    if (currentlocation == 6){
        jailProceedings();
    } else {    
        document.querySelector(`[id="cell_${currentlocation}_player"]`).src = playerimg;
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
            startGame(localsessionid);
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

// test for movement
let playbutton = document.querySelector('#play-button');
playbutton.addEventListener('click', (event) => advancePlayer(diceRoll()));