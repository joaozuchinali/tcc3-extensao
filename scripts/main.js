import { Header } from "./components/header/header.js";

document.addEventListener('DOMContentLoaded', main);

async function main() {
    Header();
}

// function chromeCall() {
//     const week = 1000 * 60 * 60 * 24 * 7;
//     const p = chrome.history.search({
//         endTime: new Date().getTime(),
//         startTime: new Date().getTime() - week,
//         text: ''
//     }, function(values) {
//         console.log(values);
//     });
// }