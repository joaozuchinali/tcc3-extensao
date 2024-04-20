// Documentação: https://dexie.org/docs/API-Reference
import Dexie from '../../plugins/dexie-3.2.7.js'
import { generateKey } from '../utils/keygenerator.js';
import { isSearchUrl } from '../utils/urls.js';

// Db name
const DB_NAME = 'tcc3-extensao';
// Db table names
const PROJECT_TABLE = "projeto-atual";
const EXT_TABLE = 'ext-table';
const DATA_TABLE = 'data';
const TIME_TABLE = 'time';
const LAST_TABLE = 'last-record';
const WINDOW_TABLE = 'window-table';
// Db version corde
const DB_VERSION = 11;

let dbExtensao = null;


// Função externalizadora que permite chamar a função de criação do banco
async function startDatabase() {
    await creatDbVer();
}

// Função centralizadora da criação do banco
// 1. Primeiro verifica se o banco já existe
// 2. Caso não existir cria o banco
async function creatDbVer(checkIfExists = true) {
    // Caso o banco não existir um novo chamamento será realizado
    if(checkIfExists) {
        await dbExists();
        return;
    }

    // Inicializa o banco
    const db = new Dexie(DB_NAME)
    setDb(db);
    await createTables();
}

// Cria as tabelas do banco e os seus campos
async function createTables() {
    dbExtensao.version(DB_VERSION).stores({
        [PROJECT_TABLE]: "++id,projectId,userId,active,running",
        [EXT_TABLE]: "++id,extId",
        [DATA_TABLE]: "++id,domain,projectId,sincstatus",
        [TIME_TABLE]: "++id,domain,projectId,time,sincstatus",
        [LAST_TABLE]: "++id",
        [WINDOW_TABLE]: "++id,wid"
    });
}

// Define o valor da variável do banco
function setDb(db) {
    dbExtensao = db;
}

// Verifica se o banco de dados já existe
//  1. Se o banco existe mas a versão é diferente chama o processo de criação
//  2. Se o banco existe mas a versão não é diferente apenas carrega o banco
//  3. Se o banco não existe chama o processo de criação
function dbExists() {
    return new Promise((resolve, reject) => {
        new Dexie(DB_NAME)
        .open()
        .then(async function (db) {
            if(db.verno != DB_VERSION) {
                await creatDbVer(false);
            } else {
                setDb(db);
            }
            resolve(true);
        })
        .catch("NoSuchDatabaseError", async function (error) {
            console.log(error);
            await creatDbVer(false);
            resolve(true);
        });
    });
}

// Cria um registro na tabela de informações sobre aa extensão
function extInfoConfig() {
    return new Promise(async (resolve, reject) => {
        try {
            await creatDbVer();
            
            const idkey = `${generateKey(200)}`;
            await dbExtensao._allTables[EXT_TABLE].clear();
            await dbExtensao._allTables[EXT_TABLE].add({ extId: idkey });
            resolve(true);
        } catch (error) {
            console.log(error);
            resolve(false);
        }
    });
}
// Retorna o registro contendo o identificador da extensão;
function extInfoConfigGet() {
    return new Promise(async (resolve, reject) => {
        try {
            await creatDbVer();
            const reg = await dbExtensao._allTables[EXT_TABLE].toArray();
            if(Array.isArray(reg) && reg.length) {
                resolve(reg[0]);
            } else {
                resolve(false);
            }
        } catch (error) {
            console.log(error);
            resolve(false);
        }
    });
}


// === Métodos que controlam o projeto ativo ===
// Recebe os valores de um registro de projeto e cadastra na tabela
function setProject(projeto) {
    return new Promise(async (resolve, reject) => {
        try {
            await creatDbVer();
            await dbExtensao._allTables[PROJECT_TABLE].add(projeto);

            resolve({status: true, msg: 'Sucesso em definir o projeto'});
        } catch (error) {
            console.log(error);
            resolve({status: false, msg: 'Falha em definir o projeto'});
        }
    });
}

// Retorna o projeto atual caso existir, ou um fallback caso não existir
function getProject() {
    return new Promise(async (resolve, reject) => {
        try {
            await creatDbVer();
    
            const registers = await dbExtensao._allTables[PROJECT_TABLE]
            .where('id')
            .notEqual(-1)
            .and(e => e.active == true)
            .toArray();
    
            if(Array.isArray(registers) && registers[0]) {
                resolve({...registers[0], status: true, msg: 'Sucesso em carregar o projeto'})
            } else {
                resolve({ projectId: '', userId: '', active: false, status: true, msg: 'Sucesso em carregar o projeto' });
            }
        } catch (error) {
            console.log(error);
            resolve({status: false, msg: 'Falha em carregar o projeto atual'});
        }
    });
}

// Muda o status de um projeto atualmente ativo
function disableProject() {
    return new Promise(async (resolve, reject) => {
        try {
            await creatDbVer();
    
            const registers = await dbExtensao._allTables[PROJECT_TABLE]
            .where('id')
            .notEqual(-1)
            .and(e => e.active == true)
            .toArray();
    
            if(Array.isArray(registers) && registers[0]) {
                await dbExtensao._allTables[PROJECT_TABLE]
                .update(
                    registers[0].id, 
                    { active: false, running: false }
                );
    
                resolve({status: true, msg: 'Sucesso em desabilitar o projeto'});
            }
        } catch (error) {
            console.log(error);
            resolve({status: false, msg: 'Falha ao desabilitar o projeto'});
        }
    });
}

// Muda o status da sessão entre executando e não executando
function setProjectSess(status = false) {
    return new Promise(async (resolve, reject) => {
        
        try {
            await creatDbVer();
    
            const queryProject = await dbExtensao._allTables[PROJECT_TABLE]
            .where('id')
            .notEqual(-1)
            .and(e => e.active == true)
            .toArray();
    
            if(Array.isArray(queryProject) && queryProject[0]) {
                const updateValues = { running: status };
                await dbExtensao._allTables[PROJECT_TABLE]
                .update(
                    queryProject[0].id, 
                    updateValues
                );
                
                resolve({status: true, msg: 'Sucesso ao configurar a sessão do projeto'});
            }
        } catch (error) {
            console.log(error);
            resolve({status: false, msg: 'Falha em configurar a sessão do projeto'});
        }
    });
}


// === Métodos que fazem a inserção e manuseio de conteúdo dentro da tabela de data ===
// Insere um registro na tabela
function insertDataRecord(record) {
    return new Promise(async (resolve, reject) => {
        
        try {
            await creatDbVer();
            
            // Valida existência de um projeto ativo rodando
            const queryProject = await dbExtensao._allTables[PROJECT_TABLE]
            .where('id')
            .notEqual(-1)
            .and(
                e => e.active == true
            ).toArray();
    
            if(!Array.isArray(queryProject) || !queryProject[0]) {
                resolve(false);
                return;
            }
    
            const projetoAtual = queryProject[0];
            if(projetoAtual.running == false) {
                resolve(false);
                return;
            }
        
            const dataInput = {...record, projectId: projetoAtual.projectId};
            await dbExtensao._allTables[DATA_TABLE].add(dataInput);
    
            // console.log('pre-datatime-op');
            await insertDataTime(record, true, true, {...projetoAtual});
            await updateLastRecord(record);
            resolve(true);
        } catch (error) {
            console.log(error);
            resolve(false);
        }
    });
}

// Função centralizadora da contabilização do tempo gasto pelo usuário em cada página
// 1. Verifica se um registro do domínio atual já existe, e cria um caso não exista
// 2. Atualiza a quantidade de tempo do domínio
// - Apenas um domínio por website e projeto, sem duplicatas
function insertDataTime(record, ignoreDbVer = false, ignoreProject = false, dataProject = null) {
    return new Promise(async (resolve, reject) => {
        try {
            if(!ignoreDbVer)
            await creatDbVer();
            
            // Valida existência de um projeto ativo rodando
            let queryProject;
            if(ignoreProject == false) {
                queryProject = await dbExtensao._allTables[PROJECT_TABLE]
               .where('id')
               .notEqual(-1)
               .and(
                   e => e.active == true
               ).toArray();
       
               if(!Array.isArray(queryProject) || !queryProject[0]) {
                   resolve(false);
                   return;
                }
            }
    
            // Verifica se o projeto está rodando
            const projetoAtual = (ignoreProject == false) ? queryProject[0] : dataProject;
            if(projetoAtual.running == false) {
                resolve(false);
                return;
            }
    
            // Retorna o registro do domínio do novo registro caso existir
            const queryTime = await dbExtensao._allTables[TIME_TABLE]
            .where('domain')
            .equals(String(record.domain))
            .and(registro => registro.projectId == projetoAtual.projectId)
            .toArray();
            
            // Domínio do novo registro não existe
            if(!Array.isArray(queryTime) || queryTime.length == 0) {
                const dataInput = {
                    domain: record.domain, 
                    projectId: projetoAtual.projectId, 
                    time: 0,
                    sincstatus: 0
                }
                await dbExtensao._allTables[TIME_TABLE].add(dataInput);
            }

            await updateTimeAmount({...projetoAtual}, record, true);

            resolve(true);
        } catch (error) {
            console.log(error);
            resolve(false);
        }
    });
}

// Função que realiza a atualização da quantidade de tempo gasto em um determinado domínio
function updateTimeAmount(projetoAtual, record, ignoreDbVer = false) {
    return new Promise(async (resolve, reject) => {
        try {
            if(!ignoreDbVer)
            await creatDbVer();
            
            // Verifica se existe último registro
            const last = await getLastRecord(true, false);
            if(last == false) {
                resolve(false);
                return;
            }
    
            // Cácula a diferença de tempo entre o acesso do último registro e do registro atual
            const timeDiff = record.acessTime - last.acessTime;

            const timeLast = (await dbExtensao._allTables[TIME_TABLE]
            .where('domain')
            .equals(String(last.domain))
            .and(registro => registro.projectId == projetoAtual.projectId)
            .toArray())[0];

            const total = (timeLast.time + timeDiff);

            // Atualiza o tempo gasto no domínio
            await dbExtensao._allTables[TIME_TABLE]
            .update(
                timeLast.id, 
                { time: total }
            );

            resolve(true);
        } catch (error) {
            console.log(error);
            resolve(false);
        }
    });
}

// Atualiza tabela que armazena o último registro capturado
function updateLastRecord(record, ignoreDbVer = false) {
    return new Promise(async (resolve, reject) => {
        try {
            if(!ignoreDbVer)
            await creatDbVer();
            
            await dbExtensao._allTables[LAST_TABLE].clear();
            await dbExtensao._allTables[LAST_TABLE].add(record);
    
            // console.log('finished last record');
            resolve(true);
        } catch (error) {
            console.log(error);
            resolve(false);
        }
    });
}

// Retorna o registro atualmente salvo como last
function getLastRecord(ignoreDbVer = false) {
    return new Promise(async (resolve, reject) => {
        try {
            if(!ignoreDbVer)
            await creatDbVer();
            
            const queryLast = await dbExtensao._allTables[LAST_TABLE].toArray();
            if(!Array.isArray(queryLast) || queryLast.length == 0) {
                resolve(false);
                return;
            }
    
            resolve(queryLast[0]);
        } catch (error) {
            console.log(error);
            resolve(false);
        }
    });
}

// Apaga o último registro
function deleteLastRecord(ignoreDbVer = false) {
    return new Promise(async (resolve, reject) => {
        try {
            if(!ignoreDbVer)
            await creatDbVer();
            
            await dbExtensao._allTables[LAST_TABLE].clear();
    
            resolve(true);
        } catch (error) {
            console.log(error);
            resolve(false);
        }
    });
}

// Atualizações de tempo do último registro em caso de fechamento do navegador
function closeUpdateLastRecord() {
    return new Promise(async (resolve, reject) => {
        
        try {
            // Valida existência de um projeto ativo rodando
            const queryProject = await dbExtensao._allTables[PROJECT_TABLE]
            .where('id')
            .notEqual(-1)
            .and(
                e => e.active == true
            ).toArray();
    
            if(!Array.isArray(queryProject) || !queryProject[0]) {
                resolve(false);
                return;
            }
    
            const projetoAtual = queryProject[0];
    
            // Valida a existência do último registro de controle
            const last = await getLastRecord(true);
    
            if(last == false) {
                resolve(false);
                return;
            }
    
            // Realiza o cáculo da diferença de tempo
            const time = (new Date()).getTime();
            const timeDiff = time - last.acessTime;
    
            // Captura o último registro da tabela de tempo para esse domínio
            const timeLast = (await dbExtensao._allTables[TIME_TABLE]
            .where('domain')
            .equals(String(last.domain))
            .and(registro => registro.projectId == projetoAtual.projectId)
            .toArray())[0];
    
            const total = (timeLast.time + timeDiff);
    
            // Atualiza o tempo gasto no domínio
            await dbExtensao._allTables[TIME_TABLE]
            .update(
                timeLast.id, 
                { time: total }
            );
    
            // Limpa a tabela de controle do último registro
            await deleteLastRecord(true);
    
            resolve(true);
        } catch (error) {
            console.log(error);
            resolve(false);
        }
    });
}

// Define a janela atualmente ativa
function setCurrentWindow(id, ignoreDbVer = false) {
    return new Promise(async (resolve, reject) => {
        try {
            if(!ignoreDbVer)
            await creatDbVer();
    
            await clearCurrentWindow(true);
            await dbExtensao._allTables[WINDOW_TABLE].add({ wid: id });
    
            resolve(true);
        } catch (error) {
            console.log(error);
            resolve(false);
        }
    });
}

// Retorna a janela atualmente ativa
function getCurrentWindow(ignoreDbVer = false) {
    return new Promise(async (resolve, reject) => {
        try {
            if(!ignoreDbVer)
            await creatDbVer();
    
            const queryLast = await dbExtensao._allTables[WINDOW_TABLE].toArray();
            if(!Array.isArray(queryLast) || queryLast.length == 0) {
                resolve(false);
                return;
            }
    
            resolve(queryLast[0]);
        } catch (error) {
            console.log(error);
            resolve(false);
        }
    });
}

// Limpa a tabela que contem os registros de janela
function clearCurrentWindow(ignoreDbVer = false) {
    return new Promise(async (resolve, reject) => {
        try {
            if(!ignoreDbVer)
            await creatDbVer();
    
            await dbExtensao._allTables[WINDOW_TABLE].clear()
            resolve(true);
        } catch (error) {
            console.log(error);
            resolve(false);
        }
    });
}

// Retorna um objeto formatado para registro no banco IndexedDB
// - recebe um objeto contendo as informações da tab atual
function formatDataRecordTabs(tabinfo) {
    let reg = { ...tabinfo };
    reg.idNav = reg.id;
    delete reg.id;

    let domain = '';
    if(isSearchUrl(reg.url)) {
        domain = reg.url != '' && reg.url != undefined ? reg.url : 'https://www.google.com/';
        domain = (new URL(reg.url));

        reg = { 
            domain: domain.hostname, 
            acessTime: (new Date()).getTime(),
            ...reg
        };
    
    } else {
        domain = (new URL(reg.url));

        reg = { 
            domain: domain.hostname, 
            acessTime: (new Date()).getTime(),
            ...reg
        };
    
    }

    const ninfo = navigator;
    reg = {
        ...reg,
        useragent: ninfo['userAgent'] ? ninfo['userAgent'] : ninfo['userAgent'],
        appversion: ninfo['appVersion'] ? ninfo['appVersion'] : '',
        contype: ninfo['connection'] ? ninfo['connection']['effectiveType'] : '',
        sincstatus: 0
    };

    return reg;
}

// Retorna os registros atuais para o sincronismo
function getRecordsToSinc(ignoreDbVer = false) {
    return new Promise(async (resolve, reject) => {
        try {
            if(!ignoreDbVer)
            await creatDbVer();
            
            // Valida existência de um projeto ativo rodando
            let queryProject = await dbExtensao._allTables[PROJECT_TABLE]
            .where('id')
            .notEqual(-1)
            .and(
                e => e.active == true
            ).toArray();
   
            if(!Array.isArray(queryProject) || !queryProject[0]) {
               resolve(false);
               return;
            }

            // Verifica se o projeto está rodando
            const projetoAtual = queryProject[0];
            if(projetoAtual.running == false) {
                resolve(false);
                return;
            }

            // Atualizar o registro atual de tempo
            const last = {...(await getLastRecord())};
            last.acessTime = (new Date()).getTime();
            await insertDataTime({...last}, true, true, {...projetoAtual});

            // Retorna todos os registros de navegação
            let navigationRecords = await dbExtensao._allTables[DATA_TABLE]
                                            .where('sincstatus')
                                            .equals(0)
                                            .and(
                                                record => record.projectId = projetoAtual.projectId
                                            )
                                            .toArray();
            // Inseri o id do usuário
            if(Array.isArray(navigationRecords) && navigationRecords.length > 0) {
                navigationRecords = navigationRecords.map(e => new Object(
                    { 
                        ...e, 
                        userId: projetoAtual.userId
                        // projectIndex: projetoAtual.projectIndex
                    }
                ));
            }
            
            // Retorna os registros de contabilização do tempo
            let timeRecords = await dbExtensao._allTables[TIME_TABLE]
                                      .where('sincstatus')
                                      .equals(0)
                                      .and(
                                        record => record.projectId = projetoAtual.projectId
                                      )
                                      .toArray();
            // Insere o id do usuário
            if (Array.isArray(timeRecords) && timeRecords.length > 0) {
                timeRecords = timeRecords.map(e => new Object(
                    { 
                        ...e, 
                        userId: projetoAtual.userId
                        // projectIndex: projetoAtual.projectIndex
                    }
                ));
            }
            
            resolve({
                navigationRecords: Array.isArray(navigationRecords) ? navigationRecords : [],
                timeRecords: Array.isArray(timeRecords) ? timeRecords : []
            });
        } catch (error) {
            console.log(error);
            resolve(false);
        }
    });
}

// Atualiza os registros alternando o status dos mesmos
function updateRecordStatus(records, tabela, ignoreDbVer = false) {
    return new Promise(async (resolve, reject) => {
        try {
            if(!ignoreDbVer)
            await creatDbVer();
            
            const updateQuery = [];
            for (const record of records) {
                record.sincstatus = 1;
                updateQuery.push(record);
            }

            console.log(dbExtensao._allTables);
            await dbExtensao._allTables[tabela].bulkPut(updateQuery);

            resolve(true);
        } catch (error) {
            console.log(error);
            resolve(false);
        }
    });
}


export { 
    extInfoConfig,
    startDatabase,
    setProject,
    getProject,
    disableProject,
    setProjectSess,
    insertDataRecord,
    formatDataRecordTabs,
    deleteLastRecord,
    closeUpdateLastRecord,
    setCurrentWindow,
    getCurrentWindow,
    clearCurrentWindow,
    extInfoConfigGet,
    getRecordsToSinc,
    updateRecordStatus,
    DATA_TABLE,
    TIME_TABLE
}