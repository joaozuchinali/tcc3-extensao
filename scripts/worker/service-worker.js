import { startDatabase, extInfoConfig, insertDataRecord, formatDataRecordTabs, deleteLastRecord } from "../db/database.js";
import { ignoreUrl, ignoreUrlNotSearch } from "../utils/urls.js";

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

// Escuta quando uma navegação é realizada, os conteúdos da página ainda não foram logados
// chrome.webNavigation.onCommitted.addListener(function() {
//     // startDatabase().then(() => {
//     // });

//     // console.log('chrome.webNavigation.onCommitted')
// });

// Verifica quando o navegador é minimizado
// let flagMinimize = true;
// chrome.windows.onFocusChanged.addListener(function(windowId) {
//     console.log('chrome.windows.onFocusChanged');
//     console.log(windowId);

//     // if(windowId == chrome.windows.WINDOW_ID_NONE) {
//     //     const reg = {
//     //         domain: 'windows:minimized', 
//     //         acessTime: (new Date()).getTime()
//     //     };

//     //     if(flagMinimize || flagMinimize == undefined) {
//     //         flagMinimize = false;
            
//     //         startDatabase().then(() => {
//     //             insertDataRecord(reg);
//     //         });
//     //     } else if (flagMinimize != undefined) {
//     //         insertDataRecord(reg);
//     //     }
    
//     //     if(flagMinimize == undefined) {
//     //         flagMinimize = true;
//     //     }
//     // } else {

//     // }
// });

// chrome.windows.onFocusChanged.addListener(async function(fWindowId) {
//     let queryOptions = { active: true, currentWindow: true };
//     let [tab] = await chrome.tabs.query(queryOptions);

//     chrome.runtime.getContexts({
//         contextTypes: ["POPUP"], 
//         documentOrigins: ["chrome-extension://nfgpfmehagclkjobkbelofhoacamdifb"]
//     }, function(context) {
//         // console.log(context);
//         if(Array.isArray(context) && context.length > 0)
//         return;

//         console.log('')

//         if(fWindowId == chrome.windows.WINDOW_ID_NONE && tab && tab.windowId != fWindowId) {
//             console.log('has minimized');
//         }
//     });
// });


// Toda vez que se carrega uma página esse método é disparado
chrome.webNavigation.onCommitted.addListener(async function(details) {
    // Links de controle dos navegadores, não interessantes para o caso da extensão
    if (ignoreUrl(details.url))
    return;

    // Não é o frame pai
    if(String(details.frameType)  != "outermost_frame")
    return;

    const tab = await getTabInfo();
    const reg = formatDataRecordTabs({...tab});
    insertDataRecord(reg);
});

// Escuta quando o navegador troca de tab
chrome.tabs.onActivated.addListener(async function() {
    const tab = await getTabInfo();

    // Links de controle dos navegadores, não interessantes para o caso da extensão
    if(ignoreUrlNotSearch(tab.url))
    return;

    console.log(tab.url);

    const reg = formatDataRecordTabs({...tab});
    insertDataRecord(reg);
});

// Retorna um objeto contendo as informações atuais da tab selecionada
async function getTabInfo() {
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);

    return tab;
}