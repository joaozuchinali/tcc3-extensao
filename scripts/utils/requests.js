import { extInfoConfigGet } from "../db/database.js";
// import { SESSAO } from "./sessao.js";
import { HTTP_REQ_ACCESS, HTTP_USO_CREATE } from "./urls.js";

// Requisição de acesso para a API
function requestAcess(identificador, codigoAcesso) {
    return new Promise((resolve, reject) => {
        // Cabeçalho da requisição
        const header = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({identificador: identificador, codigo: codigoAcesso})
        }

        // Cadeia de eventos da requisição
        fetch(HTTP_REQ_ACCESS , header)
        .then((result) => {
            if(!result) {
                resolve({ status: 2 });
            } else {
                console.log(result);
                return result.json()
            }
        })
        .then((values) => {
            console.log(values);

            if(!values.status || values.status == 'error') {
                resolve({ status: 2 });
            } else {
                // Criação do registro do usuário
                const projeto = values.data;
                return createUso(projeto);                
            }
        })
        .then((usoprojeto) => {
            if(usoprojeto == false) {
                resolve({ status: 2 });
            } else {
                resolve(usoprojeto);
            }
        })
        .catch((err) => {
            console.log(err);
            resolve({ status: 2 });
        });
    });
}

// Request para criação do usuário pesquisado no banco de dados
function createUso(projeto) {
    return new Promise(async (resolve, reject) => {
        const reg = await extInfoConfigGet();

        // registro que contem informações sobre a instalação da api não foi encontrado
        if(reg == false) {
            resolve(false);
            return;
        }

        // Cabeçalho da request
        const header = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({deviceid: reg.extId, idprojeto: projeto.idprojeto})
        }

        // Cadeia de eventos da request
        fetch(HTTP_USO_CREATE, header)
        .then((values) => {
            if(!values) {
                resolve(false);
            } else {
                return values.json();
            }
        })
        .then((values) => {
            if(!values.status || values.status == 'error') {
                resolve(false);
            } else {
                // resolve({ status: 1, project: { projectId: "ZZZXXXYYY", userId: '2187721', active: true, running: false }});
                const infos = values.data;

                resolve({
                    status: 1,
                    project: {
                        projectId: projeto.identificador,
                        userId: infos.idusopesquisados,
                        active: true,
                        running: false
                    }
                })
            }
        })
        .catch((err) => {
            console.log(err);
            resolve(false);
        });
    });
}

export {
    requestAcess
}