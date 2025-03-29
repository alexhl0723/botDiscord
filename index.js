const { Client, Collection } = require("discord.js");
require("dotenv").config();

const client = new Client({ intents: 53608447 });
const { loadSlash } = require("./handlers/slashHandler");
const { loadEvents } = require("./handlers/eventHandler");

client.slashCommands = new Collection();



// Iniciar sesión del bot
client.login(process.env.TOKEN)
    .then(() => console.log("» | Bot iniciado correctamente."))
    .catch((err) => console.error(`» | Error al iniciar sesión => ${err}`));

client.once("ready", async () => {
    console.log(`» | Bot encendido con la cuenta de: ${client.user.tag}`);

    try {
        await loadEvents(client);
        console.log("» | Eventos cargados con éxito.");

        await loadSlash(client);
        console.log("» | Comandos cargados con éxito.");
    } catch (err) {
        console.error(`» | Error al cargar eventos o comandos => ${err}`);
    }
});

module.exports = client; // Exportar el cliente
