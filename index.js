const { Client, Collection } = require("discord.js");
const { Player } = require("discord-player"); // Importar el reproductor
require("dotenv").config();

const client = new Client({ intents: 53608447 });
const { loadSlash } = require("./handlers/slashHandler");
const { loadEvents } = require("./handlers/eventHandler");

client.slashCommands = new Collection();

// 🔹 Inicializar el reproductor y asignarlo a `client.player`
client.player = new Player(client, {
    ytdlOptions: {
        quality: "highestaudio",
        highWaterMark: 1 << 25
    }
});

// Manejo de errores del reproductor
client.player.events.on("error", (queue, error) => {
    console.error(`Error en la cola de música: ${error.message}`);
});

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
