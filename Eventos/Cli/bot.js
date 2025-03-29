const { Client, GatewayIntentBits, ActivityType } = require("discord.js");
const axios = require("axios");
const mongoose = require("mongoose");
require("dotenv").config(); // Para usar variables de entorno

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

const TWITCH_CHANNELS = ["midudev", "midudev", "midudev"];

// Verificar y limpiar las credenciales
const CLIENT_ID = process.env.TWITCH_CLIENT_ID?.trim();
const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET?.trim();
const MONGO_URI = process.env.MONGO_URI?.trim();
const DISCORD_TOKEN = process.env.TOKEN?.trim();

if (!CLIENT_ID || !CLIENT_SECRET || !MONGO_URI || !DISCORD_TOKEN) {
    console.error("❌ ERROR: Faltan variables de entorno. Verifica tu archivo .env");
    process.exit(1);
}

let accessToken = null;
let tokenExpiry = 0;

// Conexión a MongoDB
async function conectarDB() {
    try {
        await mongoose.connect(MONGO_URI, { dbName: "mewinbot" });
        console.log("✅ Conexión a MongoDB exitosa");
    } catch (error) {
        console.error("❌ Error al conectar con MongoDB:", error.message);
        process.exit(1);
    }
}

async function getTwitchAccessToken() {
    const now = Date.now();
    if (accessToken && tokenExpiry > now) {
        console.log("🔄 Usando token de acceso existente");
        return accessToken;
    }

    try {
        const response = await axios.post("https://id.twitch.tv/oauth2/token", null, {
            params: {
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                grant_type: "client_credentials"
            },
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
        });

        console.log("✅ Token de acceso obtenido correctamente");

        accessToken = response.data.access_token;
        tokenExpiry = now + response.data.expires_in * 1000 - 300000;

        return accessToken;
    } catch (error) {
        console.error("❌ Error obteniendo el token de acceso:", error.response?.data || error.message);
        return null;
    }
}

async function checkTwitchStreams() {
    try {
        const token = await getTwitchAccessToken();
        if (!token) {
            console.log("⚠️ No se pudo obtener el token de acceso");
            client.user.setPresence({
                activities: [{ name: "Error de conexión con Twitch", type: ActivityType.Watching }],
                status: "dnd"
            });
            return;
        }

        const response = await axios.get("https://api.twitch.tv/helix/streams", {
            headers: {
                "Client-ID": CLIENT_ID,
                "Authorization": `Bearer ${token}`
            },
            params: { user_login: TWITCH_CHANNELS }
        });

        const liveStreams = response.data.data;

        if (liveStreams.length > 0) {
            const stream = liveStreams[0];
            console.log(`🎥 ${stream.user_name} está en vivo: ${stream.title}`);

            client.user.setPresence({
                activities: [{
                    name: `${stream.user_name}: ${stream.title}`,
                    type: ActivityType.Streaming,
                    url: `https://twitch.tv/${stream.user_name}`
                }],
                status: "online"
            });
        } else {
            console.log("⏳ Ningún canal está en vivo");
            client.user.setPresence({
                activities: [{ name: "Ningún canal está en vivo", type: ActivityType.Watching }],
                status: "idle"
            });
        }
    } catch (error) {
        console.error("❌ Error al verificar los streams de Twitch:", error.response?.data || error.message);
        
        client.user.setPresence({
            activities: [{ name: "Error de conexión con Twitch", type: ActivityType.Watching }],
            status: "dnd"
        });
    }
}

client.once("ready", async () => {
    console.log(`✅ Bot conectado como ${client.user.tag}`);
    console.log("🚀 Bot iniciado correctamente.");

    // Conectar a MongoDB
    await conectarDB();

    // Primera verificación después de inicializar
    setTimeout(() => {
        checkTwitchStreams();
        setInterval(checkTwitchStreams, 120000); // Cada 2 minutos
    }, 3000);
});

// Manejo de errores
process.on("uncaughtException", (err) => {
    console.error("🚨 Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
    console.error("🚨 Unhandled Rejection at:", promise, "reason:", reason);
});

// Conectar a Discord
client.login(DISCORD_TOKEN)
    .then(() => console.log("✅ Conectado a Discord"))
    .catch(err => {
        console.error("❌ Error al conectar a Discord:", err);
        process.exit(1);
    });
