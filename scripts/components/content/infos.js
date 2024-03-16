import { Triggers } from "../../utils/triggers.js";
import { ID_CONTENT, ABOUT_TIME, ABOUT_PROJECTS, ABOUT_REGISTERS } from "../../data/content.js";

// Função centralizadora da tab de Sobre
function ConfigInfoTab() {
    setViews();
}

// Função responsável por chamar as alterações de html na aba de 
// sobre
function setViews() {
    Triggers.showLoadding();

    const p1 = loadTime();
    const p2 = loadRegisters();
    const p3 = loadProjects();

    Promise.all([ p1, p2, p3 ])
    .then(() => {
        Triggers.hideLoadding();
    })
    .catch((err) => {
        Triggers.hideLoadding();
    });
}

// Carrega o tempo de uso
function loadTime() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            Triggers.aboutText(ABOUT_TIME, '00:00');
            resolve(true);
        }, 2000);
    });
}

// Carrega o montante de registros
function loadRegisters() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            Triggers.aboutText(ABOUT_REGISTERS, '1');
            resolve(true);
        }, 2000);
    });
}

// Carrega o montante de projetos
function loadProjects() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            Triggers.aboutText(ABOUT_PROJECTS, '1');
            resolve(true);
        }, 2000);
    });
}

export { ConfigInfoTab };