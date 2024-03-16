import { SESSAO } from "./sessao.js";
import { clsToggle } from "./style.js";
import { 
    ID_CONTENT, 
    FIELD_CONFIG_CODIGO, 
    FIELD_CONFIG_IDENTIFICADOR,
    PARAGRAPH_CONFIG_ERROR,
    TEXT_CONFIG_ERRORS,
    WRAPPER_LOADING
} from "../data/content.js";

// Limpars os campos de configuração inicial
function _clearConfigInputs() {
    const identificador = document.querySelector(`#${ID_CONTENT} #${FIELD_CONFIG_IDENTIFICADOR}`);
    const codigoAcesso = document.querySelector(`#${ID_CONTENT} #${FIELD_CONFIG_CODIGO}`);

    identificador.value = '';
    codigoAcesso.value = '';
}

// Reseta a sessão global ao estado inicial da tela de configuração
function _sessResetConfig() {
    SESSAO.load_config = true;
    SESSAO.project_loaded = null;
    SESSAO.pretend_config = false; // testes
}

// Estiliza os campos da tela de configuração inicial em caso de erro
function _styleConfigError(field, checks) {
    const pError = document.querySelector(`#${ID_CONTENT} #${PARAGRAPH_CONFIG_ERROR}`);

    clsToggle(field, 'error', 1);
    clsToggle(pError, 'hidden', 0);
    
    pError.querySelector(`#${TEXT_CONFIG_ERRORS}`).innerText = checks.message;

    setTimeout(() => {
        clsToggle(field, 'error', 0);
        clsToggle(pError, 'hidden', 1);
    }, 5000);
}

// Mesnagem de erro não relacionada aos campos na tela de configuração
function _configError(message) {
    const pError = document.querySelector(`#${ID_CONTENT} #${PARAGRAPH_CONFIG_ERROR}`);

    pError.innerText = message;
    clsToggle(pError, 'hidden', 0);

    setTimeout(() => {
        clsToggle(pError, 'hidden', 1);
    }, 5000);
}

// Exibe o loadding
function _showLoadding() {
    const loading = document.querySelector(`#${ID_CONTENT} #${WRAPPER_LOADING}`);
    clsToggle(loading, 'hidden', 0);
}

// Esconde o loadding
function _hideLoadding() {
    const loading = document.querySelector(`#${ID_CONTENT} #${WRAPPER_LOADING}`);
    clsToggle(loading, 'hidden', 1);
}

// Insere no html um valor referente a tela de Sobre
function _aboutText(id, value) {
    const about = document.querySelector(`#${ID_CONTENT} #${id}`);
    about.innerText = value;
}

// hashmap dos triggers
const Triggers = {
    clearConfigInputs: _clearConfigInputs,
    sessResetConfig: _sessResetConfig,
    styleConfigError: (field, checks) => {_styleConfigError(field, checks)},
    showLoadding: _showLoadding,
    hideLoadding: _hideLoadding,
    configError: _configError,
    aboutText: _aboutText
};

export { Triggers };