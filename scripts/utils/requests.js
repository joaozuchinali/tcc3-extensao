import { SESSAO } from "./sessao.js";

// Requisição de acesso para a API
function requestAcess(identificador, codigoAcesso) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve({ status: 1, project: { projectId: "ZZZXXXYYY", userId: '2187721', active: true, running: false }});
        }, 2000);
    });
}

export {
    requestAcess
}