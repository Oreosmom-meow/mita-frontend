'use strict';
const testbutton = document.querySelector('#testbutton')
testbutton.addEventListener('click', event => {
    console.log('button clicked')
    testfunction()
})
async function testfunction () {
    try {
        const response = await fetch(`http://127.0.0.1:5000/sum/10/20`);
        const jsonData = await response.json();
        console.log(jsonData);
    } catch (error) {
        console.log(error.message);
    }
}
