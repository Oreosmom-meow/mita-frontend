'use strict';
const target = document.querySelector('#board');

for (let i = 1; i < 23; i++){
    let cell = document.createElement('div');
    cell.id = i
    cell.classList.add('space')
    target.appendChild(cell);
}

for (let i = 1; i < 7; i++){
    let cell = document.querySelector(`[id='${i}']`);
    cell.style = `grid-column: 1; grid-row:${(7-i)} ;`;
}

for (let i = 7; i < 13; i++){
    let cell = document.querySelector(`[id='${i}']`);
    cell.style = `grid-column: ${(i-5)}; grid-row: 1;`;
}

for (let i = 13; i < 18; i++){
    let cell = document.querySelector(`[id='${i}']`);
    cell.style = `grid-column: 7; grid-row: ${(i-11)};`;
}

for (let i = 22; i > 17; i--){
    let cell = document.querySelector(`[id='${i}']`);
    cell.style = `grid-column: ${(24-i)}; grid-row: 6;`;
}

let go = document.createElement('p');
go.innerHTML = 'GO';
document.querySelector(`[id='1']`).appendChild(go);

let gotojail = document.createElement('p');
gotojail.innerHTML = 'GO TO JAIL';
document.querySelector(`[id='6']`).appendChild(gotojail);

let freeparking = document.createElement('p');
freeparking.innerHTML = 'FREE PARKING';
document.querySelector(`[id='12']`).appendChild(freeparking);

let jail = document.createElement('p');
jail.innerHTML = 'JAIL';
document.querySelector(`[id='17']`).appendChild(jail);

let incometax = document.createElement('p');
incometax.innerHTML = 'INCOME TAX <br><br> PAY 200';
document.querySelector(`[id='3']`).appendChild(incometax);

let incometax2 = document.createElement('p');
incometax2.innerHTML = 'INCOME TAX <br><br> PAY 200';
document.querySelector(`[id='9']`).appendChild(incometax2);

let luxurytax = document.createElement('p');
luxurytax.innerHTML = 'LUXURY TAX <br><br> PAY 500';
document.querySelector(`[id='18']`).appendChild(luxurytax);

let chance = document.createElement('p');
chance.innerHTML = 'CHANCE';
document.querySelector(`[id='11']`).appendChild(chance);

let chance2 = document.createElement('p');
chance2.innerHTML = 'CHANCE';
document.querySelector(`[id='14']`).appendChild(chance2);

let chance3 = document.createElement('p');
chance3.innerHTML = 'CHANCE';
document.querySelector(`[id='22']`).appendChild(chance3);

// for (let i = 1; i < 23; i++){
//     let cell = document.querySelector(`[id='${i}']`);
//     let mpt = document.createElement('img');
//     mpt.src = "img/empty_image_dumb.png"
//     mpt.id = `cell_${i}_player`
//     cell.appendChild(mpt);
// }

for (let i = 1; i < 23; i++){
    let cell = document.querySelector(`[id='${i}']`);
    let celldiv = document.createElement('div');
    let mpt = document.createElement('img');
    mpt.src = "img/empty_image_dumb.png"
    mpt.id = `cell_${i}_player`
    let mpt2 = document.createElement('img');
    mpt2.src = "img/empty_image_dumb.png"
    mpt2.id = `cell_${i}_player`
    celldiv.appendChild(mpt);
    celldiv.appendChild(mpt2);
    cell.appendChild(celldiv);
}


let jail_cell = document.querySelector('[id="cell_17_player"]');
jail_cell.alt = "jail cell";
jail_cell.src = "img/ironbar.png";    

document.querySelector('dialog').showModal();