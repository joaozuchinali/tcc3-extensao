import { ConfigContentTab } from "../components/content/config.js";
import { ConfigInfoTab } from "../components/content/infos.js";

// variáveis de configuração dos conteúdos
const ID_CONTENT = "content";
const CONFIG_CONTENT = "config";
const INFO_CONTENT = "info";
const FIELD_CONFIG_IDENTIFICADOR = 'identificador-projeto';
const FIELD_CONFIG_CODIGO = 'senha-projeto';
const PARAGRAPH_CONFIG_ERROR = 'paragraph-config-error';
const TEXT_CONFIG_ERRORS = 'text-config-errors';
const WRAPPER_LOADING = 'wrapper-loading'
const ABOUT_TIME = 'about-time';
const ABOUT_REGISTERS = 'about-registers';
const ABOUT_PROJECTS = 'about-projects';

// Hashmap com as funções de configuração de cada conteúdo
const contentSetMap = {
    [CONFIG_CONTENT]: ConfigContentTab,
    [INFO_CONTENT]: ConfigInfoTab
};

// Chamamento da configuração do conteúdo
function setContentConfig(id) {
    try {
        if(contentSetMap[id] && typeof contentSetMap[id] == 'function')
        contentSetMap[id]();
    } catch (error) {
        console.log(error);
        console.error('scripts/data/content.js | setContent()');  
    }
}

export { 
    ID_CONTENT, 
    CONFIG_CONTENT, 
    INFO_CONTENT, 
    FIELD_CONFIG_IDENTIFICADOR,
    FIELD_CONFIG_CODIGO,
    PARAGRAPH_CONFIG_ERROR,
    TEXT_CONFIG_ERRORS,
    WRAPPER_LOADING,
    ABOUT_PROJECTS,
    ABOUT_TIME,
    ABOUT_REGISTERS,
    setContentConfig
};