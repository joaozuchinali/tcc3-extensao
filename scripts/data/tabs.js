import { CONFIG_CONTENT, INFO_CONTENT } from "./content.js";

// Variáveis de configuração das tabs
const HEADER_ID = "tabs-header";
const TABS = [
    {
        "name": "Configuração",
        "id": "config-tab",
        "template_id": "template-config",
        "content": CONFIG_CONTENT
    }
    // {
    //     "name": "Sobre",
    //     "id": "status-tab",
    //     "template_id": "template-infos",
    //     "content": INFO_CONTENT
    // }
];

export { TABS, HEADER_ID };