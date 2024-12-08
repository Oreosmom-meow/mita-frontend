'use strict';

let player = {location: 1, money: 0}

const playerimg = 'img/player.png'

document.querySelector('[id="cell_1_player"]').src = playerimg;

const startform = document.querySelector('#start-game');
let username = '';

function jailProceedings(){
    document.querySelector(`[id="cell_17_player"]`).src = 'img/cat_jail.png';
    document.querySelector('#action-window').style.display = 'none';
    document.querySelector('#jail-window').style.display = 'block';
}

function diceRoll(){
    let roll = Math.floor(Math.random()*6) + Math.floor(Math.random()*6);
    document.querySelector('#roll-value').innerHTML = roll;
    return roll;
}

function advancePlayer(step){
    let currentlocation = player.location;
    let oldlocation = currentlocation;
    currentlocation += step;
    if (currentlocation > 22){
        currentlocation -= 22;
    }
    player.location = currentlocation;

    let round = parseInt(document.querySelector('[id="current-round"]').innerHTML);
    round++;
    document.querySelector('[id="current-round"]').innerHTML = round;
    
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

startform.addEventListener('submit', async function(event){
    event.preventDefault();

    username = document.querySelector('input[name=username]').value;

    try{
        const response = await fetch(`http://localhost/gameapi/start/${username}`);
        const jsonData = await response.json();
        console.log(jsonData);
        document.querySelector('dialog').close();
    } catch (error){
        console.log(error);
        document.querySelector('#start-info').innerHTML = `something went wrong. info: ${error}`
    }

});

let playbutton = document.querySelector('#play-button');
playbutton.addEventListener('click', (event) => advancePlayer(diceRoll()));

/*
BAD CODE! BAD
DO NOT
*/