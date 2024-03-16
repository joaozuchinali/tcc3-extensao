import { TABS, HEADER_ID } from '../../data/tabs.js';
import { ID_CONTENT, setContentConfig } from '../../data/content.js';
import { setEventListenners } from '../../utils/events.js';

// Variáveis gerais do componente de tabs
let SELECTED_TAB = null;

// Contralizador do componente de tabs superios
function Header() {
    try {
        setTabs();
        headerEvents();
        toggleTabSelected(TABS[0]);
    } catch (error) {
        console.log(error);
        console.error('scripts/components/header/header.js | Header()');        
    }
}

// Inseri as tabs no component de tabs
function setTabs() {
    try {
        const tabsElement = document.getElementById(HEADER_ID);
        tabsElement.innerHTML = '';
    
        for (const tab of TABS) {
            const tabHtml = `<div class="itens" id="${tab.id}" data-tab="${TABS.indexOf(tab)}">${tab.name}</div>`
            tabsElement.innerHTML += tabHtml;
        }
    } catch (error) {
        console.log(error);
        console.error('scripts/components/header/header.js | setTabs()');     
    }
}

// Evento disparado ao selecionar uma tab
function selectedTab(event) {
    try {
        const tabEl = event.target;
        const indice = tabEl.dataset.tab;
        const tabInfo = TABS[indice];

        if(SELECTED_TAB.id != tabInfo.id) {
            toggleTabSelected(tabInfo)
        }
    } catch (error) {
        console.log(error);
        console.error('scripts/components/header/header.js | selectedTab()');    
    }
}

// Realiza a troca da tab selecionada atualmente
function toggleTabSelected(tabInfo) {
    try {
        if(SELECTED_TAB != null)
        document.getElementById(SELECTED_TAB.id).classList.remove('active');

        SELECTED_TAB = tabInfo;
        document.getElementById(SELECTED_TAB.id).classList.add('active');
        loadTabContent();
    } catch (error) {
        console.log(error);
        console.error('scripts/components/header/header.js | toggleTabSelected()');   
    }
}

// Função de carregamento dos conteúdos da tab selecionada
function loadTabContent() {
    try {
        const template = document.getElementById(SELECTED_TAB.template_id);
        if(template) {
            const clone = template.content.cloneNode(true);

            const content = document.getElementById(ID_CONTENT);
            content.children[0].remove();
            content.prepend(clone);
            content.appendChild(clone);
            setContentConfig(SELECTED_TAB.content)
        }
    } catch (error) {
        console.log(error);
        console.error('scripts/components/header/header.js | loadTabContent()');  
    }
}

// Configura os eventos atribuidos as tabs
function headerEvents() {
    try {
        for (const tab of TABS) {
            setEventListenners(
                `#${tab.id}`,
                [
                    'click'
                ], 
                [
                    selectedTab
                ]
            );
        }
    } catch (error) {
        console.log(error);
        console.error('scripts/components/header/header.js | headerEvents()'); 
    }
}

export { Header };