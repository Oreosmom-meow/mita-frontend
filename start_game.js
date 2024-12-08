'use strict';

// temp, should get this from the flask
let player = {location: 1, money: 0}

const playerimg = 'img/player.png'

// sets player icon onto go space
document.querySelector('[id="cell_1_player"]').src = playerimg;

const startform = document.querySelector('#start-game');
let username = '';

// temp, hopefully. puts player in jail.
function jailProceedings(){
    player.location = 17;
    document.querySelector(`[id="cell_17_player"]`).src = 'img/cat_jail.png';
    document.querySelector('#action-window').style.display = 'none';
    document.querySelector('#jail-window').style.display = 'block';

    document.querySelector('#jail-card-button').addEventListener('click', (event) => {
        document.querySelector(`[id="cell_17_player"]`).src = playerimg;
        document.querySelector('#jail-window').style.display = 'none';
        document.querySelector('#action-window').style.display = 'block';
        })
}

// rolls the dice
// actual roll should be in the flask
function diceRoll(){
    let roll = Math.floor(Math.random()*6) + Math.floor(Math.random()*6);
    document.querySelector('#roll-value').innerHTML = roll;
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

// (hopefully) actually start the game
startform.addEventListener('submit', async function(event){
    event.preventDefault();

    username = document.querySelector('input[name=username]').value;
    if (username !== ''){
        try{
            const response = await fetch(`http://localhost/gameapi/start/${username}`);
            const jsonData = await response.json();
            console.log(jsonData);
            // todo: actually use data to set up the game
            // this, however, needs a functional backend
            document.querySelector('dialog').close();
        } catch (error){
            console.log(error);
            document.querySelector('#start-info').innerHTML = `something went wrong. info: ${error}`;
        }
    } else{
            document.querySelector('#start-info').innerHTML = 'please enter an username';
    }
});


// test for movement
let playbutton = document.querySelector('#play-button');
playbutton.addEventListener('click', (event) => advancePlayer(diceRoll()));