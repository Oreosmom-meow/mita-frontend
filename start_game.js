'use strict';
const startform = document.querySelector('#start-game');
let username = '';

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