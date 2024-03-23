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
chrome.tabs.onActivated.addListener(function() {
    const url = window.location.
    startDatabase().then(() => {
        insertDataRecord({ url: "xxx" });
    });
});