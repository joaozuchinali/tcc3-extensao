import { 
    startDatabase, 
    extInfoConfig, 
    insertDataRecord, 
    formatDataRecordTabs, 
    deleteLastRecord, 
    closeUpdateLastRecord,
    getCurrentWindow,
    setCurrentWindow
} from "../db/database.js";

import { 
    ignoreUrl, 
    ignoreUrlNotSearch 
} from "../utils/urls.js";


// Inicializa o banco todas as vezes que abrir o navegador
chrome.runtime.onStartup.addListener(function() {
    startDatabase().then((e) => {
        deleteLastRecord(true);
    });
});

// Inicializa o banco e faz um registro de controle quando a extensão é instalada
chrome.runtime.onInstalled.addListener(function() {
    startDatabase().then(e => {
        extInfoConfig();
    });
});

// Verifica quando a janela foi fechada
chrome.tabs.onRemoved.addListener(function(tabId,removeInfo) {
    if(removeInfo.isWindowClosing) {
        chrome.windows.getAll({}, function(all) {
            if(!Array.isArray(all) || all.length == 0) {
                closeUpdateLastRecord();
            }
        });
    }
});


// Evento: chrome.webNavigation.onCommitted
async function committedEvent(details) {
    // Links de controle dos navegadores, não interessantes para o caso da extensão
    if (ignoreUrl(details.url))
    return;

    // Não é o frame pai
    if(String(details.frameType)  != "outermost_frame")
    return;

    const tab = await getTabInfo();
    const reg = formatDataRecordTabs({...tab});
    insertDataRecord(reg);
}
// Toda vez que se carrega uma página esse método é disparado
chrome.webNavigation.onCommitted.addListener(committedEvent);


// Evento: chrome.tabs.onActivated
async function tabActiveEvent() {
    const tab = await getTabInfo();

    // Links de controle dos navegadores, não interessantes para o caso da extensão
    if(ignoreUrlNotSearch(tab.url))
    return;

    const reg = formatDataRecordTabs({...tab});
    insertDataRecord(reg);
}
// Escuta quando o navegador troca de tab
chrome.tabs.onActivated.addListener(tabActiveEvent);


// Evento: chrome.windows.onFocusChanged
function focusChangedEvent(windowId) {
    if(chrome.windows.WINDOW_ID_NONE == windowId)
    return;

    chrome.windows.getCurrent({}, async function(data) {
        // Não é a janela atualmente selecionada
        if(data.focused == false)
        return;

        const cWindow = await getCurrentWindow();

        // Não existe nenhuma janela atualmente registrada
        if(cWindow == false) {
            setCurrentWindow(windowId);
            tabActiveEvent();
            return;
        }
        
        // Janela atual já é a mais atualizada na tabela
        if(cWindow.wid == windowId) {
            return;
        }

        // Nesse caso a janela atual não é WINDOW_ID_NONE e também não é a janela atual portanto é necessário capturar a tab atual
        setCurrentWindow(windowId);
        tabActiveEvent();
    });
}
// Disparado quando o focus da janela é alternado
// 1 - É um método inconsistente
// 2 - Pode disparar múltiplas vezes em uma mesma janela sem alternar entre abas
chrome.windows.onFocusChanged.addListener(focusChangedEvent, {windowTypes: ['normal']});


// Retorna um objeto contendo as informações atuais da tab selecionada
async function getTabInfo() {
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);

    return tab;
}