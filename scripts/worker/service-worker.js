import { startDatabase, extInfoConfig, insertDataRecord } from "../db/database.js";

// Inicializa o banco todas as vezes que abrir o navegador
chrome.runtime.onStartup.addListener(function() {
    startDatabase();
});

// Inicializa o banco e faz um registro de controle quando a extensão é instalada
chrome.runtime.onInstalled.addListener(function() {
    startDatabase().then(e => {
        extInfoConfig();
    });
});

// Escuta quando uma navegação é realizada, os conteúdos da página ainda não foram logados
// chrome.webNavigation.onCommitted.addListener(function() {
//     startDatabase().then(() => {
//     });
// });

// Escuta quando o navegador troca de tab
let firstTabClick = true;
chrome.tabs.onActivated.addListener(async function() {
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);

    let reg = { ...tab };
    reg.idNav = reg.id;
    delete reg.id;

    if(firstTabClick || firstTabClick == undefined) {
        firstTabClick = false
        startDatabase().then(() => {
            // checkDataRecord(reg)
            insertDataRecord(reg);
        });
    } else if (firstTabClick != undefined) {
        // checkDataRecord(reg)
        insertDataRecord(reg);
    }

    if(firstTabClick == undefined) {
        firstTabClick = true;
    }
});
