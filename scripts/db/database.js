// Documentação: https://dexie.org/docs/API-Reference
import Dexie from '../../plugins/dexie-3.2.7.js'
import { generateKey } from '../utils/keygenerator.js';

// Db name
const DB_NAME = 'tcc3-extensao';
// Db table names
const PROJECT_TABLE = "projeto-atual";
const EXT_TABLE = 'ext-table';
const DATA_TABLE = 'data';
// Db version corde
const DB_VERSION = 5;

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
        [DATA_TABLE]: "++id,url"
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
        await creatDbVer();
        
        dbExtensao.transaction('rw', EXT_TABLE, async function () {
            const idkey = `${generateKey(200)}`;
            await dbExtensao._allTables[EXT_TABLE].add({ extId: idkey });
            resolve(true);
        }).catch(error => {
            console.log(error);
        });
    });
}


// === Métodos que controlam o projeto ativo ===
// Recebe os valores de um registro de projeto e cadastra na tabela
function setProject(projeto) {
    return new Promise(async (resolve, reject) => {
        await creatDbVer();
        
        dbExtensao.transaction('rw', PROJECT_TABLE, async function () {
            await dbExtensao._allTables[PROJECT_TABLE].add(projeto);
            resolve(true);
        }).catch(error => {
            console.log(error);
            resolve(false);
        });
    });
}

// Retorna o projeto atual caso existir, ou um fallback caso não existir
function getProject() {
    return new Promise(async (resolve, reject) => {
        await creatDbVer();

        dbExtensao.transaction('rw', PROJECT_TABLE, async function () {
            const registers = await dbExtensao._allTables[PROJECT_TABLE].where('id').notEqual(-1).and(e => e.active == true).toArray();

            if(Array.isArray(registers) && registers[0]) {
                resolve(registers[0])
            } else {
                resolve({ projectId: '', userId: '', active: false });
            }
        }).catch(error => {
            console.log(error);
            resolve({ projectId: '', userId: '', active: false });
        });
    });
}

// Muda o status de um projeto atualmente ativo
function disableProject() {
    return new Promise(async (resolve, reject) => {
        await creatDbVer();

        dbExtensao.transaction('rw', PROJECT_TABLE, async function () {
            const registers = await dbExtensao._allTables[PROJECT_TABLE].where('id').notEqual(-1).and(e => e.active == true).toArray();

            if(Array.isArray(registers) && registers[0]) {
                await dbExtensao._allTables[PROJECT_TABLE].update(registers[0].id, { active: false, running: false });
                resolve(true);
            }
        }).catch(error => {
            console.log(error);
            resolve(false);
        });
    });
}

// Muda o status da sessão entre executando e não executando
function setProjectSess(status = false) {
    return new Promise(async (resolve, reject) => {
        await creatDbVer();

        dbExtensao.transaction('rw', PROJECT_TABLE, async function () {
            const registers = await dbExtensao._allTables[PROJECT_TABLE].where('id').notEqual(-1).and(e => e.active == true).toArray();

            if(Array.isArray(registers) && registers[0]) {
                await dbExtensao._allTables[PROJECT_TABLE].update(registers[0].id, { running: status});
                resolve(true);
            }
        }).catch(error => {
            console.log(error);
            resolve(false);
        });
    });
}


// === Métodos que fazem a inserção e manuseio de conteúdo dentro da tabela de data ===
// Insere um registro na tabela
function insertDataRecord(record) {
    return new Promise(async (resolve, reject) => {
        await creatDbVer();
        
        dbExtensao.transaction('rw', DATA_TABLE, async function () {
            await dbExtensao._allTables[DATA_TABLE].add(record);
            resolve(true);
        }).catch(error => {
            console.log(error);
            resolve(false);
        });
    });
}

export { 
    extInfoConfig,
    startDatabase,
    setProject,
    getProject,
    disableProject,
    setProjectSess,
    insertDataRecord
}