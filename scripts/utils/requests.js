import { 
    extInfoConfigGet,
    updateRecordStatus,
    TIME_TABLE,
    DATA_TABLE 
} from "../db/database.js";
import { 
    HTTP_REQ_ACCESS, 
    HTTP_USO_CREATE,
    HTTP_POST_DATA,
    HTTP_POST_TIME 
} from "./urls.js";

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
                        projectIndex: projeto.idprojeto,
                        userId: infos.idusopesquisados,
                        active: true,
                        running: false
                    }
                });
            }
        })
        .catch((err) => {
            console.log(err);
            resolve(false);
        });
    });
}

// Centralizador do envio de registros
function sendDataToServer(dataInfo) {
    return new Promise(async (resolve, reject) => {
        if(dataInfo == false) {
            console.log('no sess');
            resolve(false);
            return;
        }

        if(Array.isArray(dataInfo.navigationRecords) && dataInfo.navigationRecords.length != 0) {
            await sendRecordsNavigation(dataInfo.navigationRecords);
        } else {
            console.log('no data');
        }

        if(Array.isArray(dataInfo.timeRecords) && dataInfo.timeRecords.length != 0) {
            console.log('time sent')
            await sendTimeValues(dataInfo.timeRecords);
        } else {
            console.log('no time');
        }
    });
}

// Enviar os registros de navegação
async function sendRecordsNavigation(input) {
    const base = [...input];

    const bodyData = {
        idusopesquisados: base[0].userId,
        identificador: base[0].projectId,
        registros: []
    }

    for (const record of base) {
        bodyData.registros.push({
            acessTime: record.acessTime,
            dominio: record.domain,
            incognito: record.incognito,
            title: record.title,
            url: record.url,
            favIconUrl: record.favIconUrl ? record.favIconUrl : "",
            width: record.width,
            height: record.height,
            useragent: record.useragent ? record.useragent : "",
            appversion: record.appversion ? record.appversion : "",
            contype: record.contype,
            idusopesquisados: record.userId
        });
    }

    const headerNavigation = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(bodyData)
    }

    const infoData       = await fetch(HTTP_POST_DATA, headerNavigation);
    const parsedInfoData = await infoData.json();
    if(parsedInfoData.status == 'success') {
        console.log('data sent');
        updateRecordStatus(base, DATA_TABLE);
    }
}


// Enviar registros de tempo
async function sendTimeValues(input) {
    const base = [...input];

    const bodyData = {
        idusopesquisados: base[0].userId,
        identificador: base[0].projectId,
        registros: []
    }

    for (const record of base) {
        if(!record.domain || record.userId == 0 || record.projectId == 0)
            continue;

        bodyData.registros.push({
            tempo: record.time,
            dominio: record.domain,
            idusopesquisados: record.userId
        });
    }

    const headerTime = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(bodyData)
    }
    // console.log(headerTime);
    const infoTime       = await fetch(HTTP_POST_TIME, headerTime);
    const parsedInfoTime = await infoTime.json();
    if(parsedInfoTime.status == 'success') {
        console.log('time sent');
        updateRecordStatus(base, TIME_TABLE);
    }
}


export {
    requestAcess,
    sendDataToServer
}