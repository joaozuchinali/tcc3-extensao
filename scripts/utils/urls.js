// const HTTP_REQ_ACCESS = 'https://joaozucchinalighislandi.com.br/api/projetos/access/';
const HTTP_REQ_ACCESS = 'http://localhost:12005/api/projetos/access/';
const HTTP_USO_CREATE = 'http://localhost:12005/api/usopesquisa/create/';
const HTTP_POST_DATA  = 'http://localhost:12005/api/registros/navegacao/';
const HTTP_POST_TIME  = 'http://localhost:12005/api/registros/tempo/';


// Lista completa de urls de controle para serem ignoradas
function ignoreUrl(urlCompare) {
    if (
        String(urlCompare).trim() == '' ||
        String(urlCompare).trim() == undefined ||
        String(urlCompare) == "chrome://new-tab-page/" ||
        String(urlCompare) == "chrome://newtab/" ||
        String(urlCompare).includes('ogs.google.com')  ||
        String(urlCompare).includes('https://www.google.com/')  || 
        String(urlCompare).includes('www.googleadservices.com') ||
        String(urlCompare).includes('about:blank') ||
        String(urlCompare).includes('chrome-untrusted://new-tab-pag') ||
        String(urlCompare).includes('devtools://devtools') ||
        String(urlCompare).includes('chrome://extensions/')
    )
    return true;

    return false;
}

// Lista de urls de controle, fora as de pesquisa
function ignoreUrlNotSearch(urlCompare) {
    if (
        String(urlCompare).includes('ogs.google.com')  ||
        String(urlCompare).includes('www.googleadservices.com') ||
        String(urlCompare).includes('about:blank') ||
        String(urlCompare).includes('chrome-untrusted://new-tab-pag')
        
    )
    return true;

    return false;
}

// Verifica se a url é um link de pesquisa
function isSearchUrl(urlCompare) {
    if (
        String(urlCompare).trim() == '' ||
        String(urlCompare).trim() == undefined ||
        String(urlCompare) == "chrome://new-tab-page/" ||
        String(urlCompare) == "chrome://newtab/" ||
        String(urlCompare).includes('https://www.google.com/') || 
        String(urlCompare).includes('devtools://devtools') || 
        String(urlCompare).includes('chrome://extensions/')
    )
    return true;

    return false;
}


export { 
    ignoreUrl,
    ignoreUrlNotSearch,
    isSearchUrl,
    HTTP_REQ_ACCESS,
    HTTP_USO_CREATE,
    HTTP_POST_DATA,
    HTTP_POST_TIME
}