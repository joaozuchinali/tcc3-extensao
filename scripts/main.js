import { startDatabase } from "./db/database.js";
import { Header } from "./components/header/header.js";

document.addEventListener('DOMContentLoaded', main);

async function main() {
    await startDatabase();
    Header();
}