// Documentação: https://dexie.org/docs/API-Reference
import Dexie from '../../plugins/dexie-3.2.7.js'
import { generateKey } from '../utils/keygenerator.js';

// Db name
const DB_NAME = 'tcc3-extensao';
// Db table names
const PROJECT_TABLE = "projeto-atual";
const EXT_TABLE = 'ext-table';
const DATA_TABLE = 'data';
const TIME_TABLE = 'time';
const LAST_TABLE = 'last-record'
// Db version corde
const DB_VERSION = 8;

let dbExtensao = null;


// Função externalizadora que permite chamar a função de criação do banco
async function startDatabase() {
    await creatDbVer();
}

// Define o valor da variável do banco
function setDb(db) {
    dbExtensao = db;
}

// Função centralizadora da criação do banco
// 1. Primeiro verifica se o banco já existe
// 2. Caso não existir cria o banco
async function creatDbVer(ignore = true) {
    if(ignore) {
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
        [DATA_TABLE]: "++id,domain,projectId",
        [TIME_TABLE]: "++id,domain,projectId,time",
        [LAST_TABLE]: "++id"
    });
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
    
            console.log('pre-datatime-op');
            await insertDataTime(record);
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
function insertDataTime(record, ignoreDbVer = false) {
    return new Promise(async (resolve, reject) => {
        try {
            if(!ignoreDbVer)
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
    
            // Verifica se o projeto está rodando
            const projetoAtual = queryProject[0];
            if(projetoAtual.running == false) {
                resolve(false);
                return;
            }
    
            // Retorna o registro do demínio atual caso existir
            const queryTime = await dbExtensao._allTables[TIME_TABLE]
            .where('domain')
            .equals(String(record.domain))
            .and(registro => registro.projectId == projetoAtual.projectId)
            .toArray();
    
            if(!Array.isArray(queryTime) || queryTime.length == 0) {
                const dataInput = {
                    domain: record.domain, 
                    projectId: projetoAtual.projectId, 
                    time: 0
                }
                await dbExtensao._allTables[TIME_TABLE].add(dataInput);
            } else {
                await updateTimeAmount({...queryTime[0]}, {...projetoAtual}, record, true);
            }
    
            console.log('finished insertDataTime');
            resolve(true);
        } catch (error) {
            console.log(error);
            resolve(false);
        }
    });
}

// Função que realiza a atualização da quantidade de tempo gasto em um determinado domínio
// **Assume-se que a função sempre será chamada dentro de uma transaction pai**
function updateTimeAmount(currentTime, projetoAtual, record, ignoreDbVer = false) {
    return new Promise(async (resolve, reject) => {
        try {
            if(!ignoreDbVer)
            await creatDbVer();
            
            const last = await getLastRecord(true, false);
            if(last == false) {
                resolve(false);
                return;
            }
    
            const timeDiff = record.acessTime - last.acessTime;
            const total = (currentTime.time != undefined && !isNaN(currentTime.time) ? currentTime.time : 0) + timeDiff;
    
            console.log(currentTime, record);
            console.log(record.acessTime, last.acessTime, currentTime.time);
            console.log(timeDiff, total);
    
            await dbExtensao._allTables[TIME_TABLE]
            .update(
                currentTime.id, 
                { time: total }
            );
    
            console.log('finished update');
            resolve(true);
        } catch (error) {
            console.log(error);
            resolve(false);
        }
    });
}

// Atualiza tabela que armazena o último registro capturado
// **Assume-se que a função sempre será chamada dentro de uma transaction pai**
function updateLastRecord(record, ignoreDbVer = false) {
    return new Promise(async (resolve, reject) => {
        try {
            if(!ignoreDbVer)
            await creatDbVer();
            
            await dbExtensao._allTables[LAST_TABLE].clear();
            await dbExtensao._allTables[LAST_TABLE].add(record);
    
            console.log('finished last record');
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

// Retorna um objeto formatado para registro no banco IndexedDB
// - recebe um objeto contendo as informações da tab atual
function formatDataRecordTabs(tabinfo) {
    let reg = { ...tabinfo };
    reg.idNav = reg.id;
    delete reg.id;

    let domain = (new URL(reg.url));
    reg = { 
        domain: domain.hostname, 
        acessTime: (new Date()).getTime(),
        ...reg
    };

    return reg;
}

export { 
    extInfoConfig,
    startDatabase,
    setProject,
    getProject,
    disableProject,
    setProjectSess,
    insertDataRecord,
    formatDataRecordTabs
}