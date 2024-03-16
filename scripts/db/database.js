import { SESSAO } from "../utils/sessao.js";

// Inicializa o banco de dados
function startDatabase() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(true);
        }, 2000);
    });
}

// Requisição de acesso para a API
function requestAcess(identificador, codigoAcesso) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve({ status: 1, project: { projectId: "ZZZXXXYYY", exists: false }});
        }, 2000);
    });
}

// Verifica um projeto e determina ele como base
function setProject(projeto) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(true);
        }, 2000);
    });
}

// Limpa o projeto atual e deixa disponível para um novo projeto
function cleanProject() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(true);
        }, 2000);
    });
}

// Retorna o projeto atual
function getProject() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Para propositos de teste, apenas
            if(SESSAO.pretend_config == true) {
                resolve({ projectId: "ZZZXXXYYY", exists: true });
                return;
            }

            resolve({ projectId: "ZZZXXXYYY", exists: false });
        }, 2000);
    });
}

export { 
    startDatabase,
    requestAcess,
    setProject,
    cleanProject,
    getProject
}