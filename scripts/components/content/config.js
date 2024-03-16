import { getProject, requestAcess, setProject, cleanProject } from "../../db/database.js";
import { SESSAO } from "../../utils/sessao.js";
import { Triggers } from "../../utils/triggers.js";
import { clsToggle } from "../../utils/style.js";
import { validation } from "../../utils/validator.js";

// Função centralizadora da tab de Configuração
function ConfigContentTab() {
    setEvents();
    setViews();
}

// Função responsável por chamar as alterações de html na aba de 
// configuração
function setViews() {
    if(SESSAO.load_config == true) {
        getProject()
        .then((project) => {
            changeView(project)
        })
        .catch((err) => {
            console.log(err);
            Triggers.hideLoadding();
        })
    }
    else {
        changeView(SESSAO.project_loaded);
    }
}

// Função que realizar as alterações no html
function changeView(project) {
    const configRowBtn = document.querySelector('#content #config-project-wrapper');
    const spanInfoRow = document.querySelector('#content #project-infos-wrapper');
    const noConfiMessage = document.querySelector("#content #no-config-message");
    const configMessage = document.querySelector('#content #config-message');
    const btnEndProject = document.querySelector("#content #wrapper-encerrar-sessao");
    const configRowFields = document.querySelector("#content #config-fields-wrapper");
    const sessControlBtns = document.querySelector("#content #sess-controls-wrapper");

    const cls = 'hidden'
    
    if(project.exists) {
        // Card superior
        clsToggle(noConfiMessage, cls, 1);
        clsToggle(configMessage, cls, 0);
        clsToggle(btnEndProject, cls, 0);

        // Botão e linhas centrais
        clsToggle(configRowFields, cls, 1);
        clsToggle(configRowBtn, cls, 1);

        clsToggle(spanInfoRow, cls, 0);
        spanInfoRow.querySelector('#projeto-infos').innerText = `Código do projeto ${project.projectId}`;

        // Botões de início e fim de sessão
        clsToggle(sessControlBtns, cls, 0);
        Triggers.clearConfigInputs();
    } else {
        // Card superior    
        clsToggle(noConfiMessage, cls, 0);
        clsToggle(configMessage, cls, 1);
        clsToggle(btnEndProject, cls, 1);

        // Botão e linhas centrais
        clsToggle(configRowFields, cls, 0);
        clsToggle(configRowBtn, cls, 0);

        clsToggle(spanInfoRow, cls, 1);

        // Botões de início e fim de sessão
        clsToggle(sessControlBtns, cls, 1);
    }

    SESSAO.load_config = false;
    SESSAO.project_loaded = JSON.parse(JSON.stringify(project));
    Triggers.hideLoadding();
}

// Define os eventos da tela de configuração
function setEvents() {
    const configProject = document.querySelector("#content #config-project")
    const initSess      = document.querySelector('#content #start-sess');
    const endSess       = document.querySelector("#content #end-sess");
    const endProject    = document.querySelector("#content #end-project");

    configProject.addEventListener('click', configStart);
    initSess.addEventListener('click', () => startSession(initSess, endSess));
    endSess.addEventListener('click', () => endSession(initSess, endSess));
    endProject.addEventListener('click', projectDisconnect);
}

// Inicicaliza um projeto na extensão
async function configStart() {
    Triggers.showLoadding();
    const identificador = document.querySelector('#content #identificador-projeto');
    const codigoAcesso = document.querySelector("#content #senha-projeto");

    // Verifica o campo do identificador
    const checks1 = validation(identificador.value, {
        minLength: 9,
        maxLength: 9,
        isChar: true,
        isField: true, fieldName: 'Identificador'
    });
    if(checks1.error == true) {
        Triggers.styleConfigError(identificador, checks1);
        Triggers.hideLoadding();
        return;
    }

    // Verifica o campo do código de acesso
    const checks2 = validation(codigoAcesso.value, {
        maxLength: 6,
        minLength: 6,
        isNumber: true,
        isField: true, fieldName: 'Código de Acesso'
    });
    if(checks2.error == true) {
        Triggers.styleConfigError(codigoAcesso, checks2);
        Triggers.hideLoadding();
        return;
    }

    const acessrequest = await requestAcess(identificador.value, codigoAcesso.value);
    if(acessrequest.status == 1) {
        console.log('acessrequest entered')
        const setter = await setProject(acessrequest.project);
        SESSAO.pretend_config = true; // testes
        
        SESSAO.load_config = true;
        SESSAO.project_loaded = null;

        setViews();
    } else {
        Triggers.hideLoadding();
        Triggers.configError('Falha em requisitar o acesso');
    }
}

// Inicializa uma sessão
function startSession(initSess, endSess) {
    SESSAO.session_active = true;
    initSess.classList.add('hidden');
    endSess.classList.remove('hidden');

    // ... faça algo
}

// Finaliza uma sessão
function endSession(initSess, endSess) {
    SESSAO.session_active = false;
    initSess.classList.remove('hidden');
    endSess.classList.add('hidden');

    // ... faça algo
}

// Desconecta um projeto
function projectDisconnect() {
    SESSAO.session_active = false;

    Triggers.showLoadding();
    cleanProject().then((e) => {
        Triggers.sessResetConfig();
        setViews();
    })
    .catch((err) => {
        console.log(err);
        Triggers.hideLoadding();
    });
}

export { ConfigContentTab };