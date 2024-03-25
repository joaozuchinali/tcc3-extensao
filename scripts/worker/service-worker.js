import { startDatabase, extInfoConfig, insertDataRecord, formatDataRecordTabs } from "../db/database.js";

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
    const tab = await getTabInfo();
    const reg = formatDataRecordTabs({...tab});

    if(firstTabClick || firstTabClick == undefined) {
        firstTabClick = false;
        
        startDatabase().then(() => {
            insertDataRecord(reg);
        });
    } else if (firstTabClick != undefined) {
        insertDataRecord(reg);
    }

    if(firstTabClick == undefined) {
        firstTabClick = true;
    }
});

// Retorna um objeto contendo as informações atuais da tab selecionada
async function getTabInfo() {
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);

    return tab;
}