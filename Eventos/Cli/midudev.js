const { Client, ActivityType } = require("discord.js");
const axios = require("axios");

const client = new Client({ intents: 53608447 });

const TWITCH_CHANNEL = "midudev"; // Nombre del canal de Twitch
const CLIENT_ID = "acbc4f8wz55dpxotw7g1o4ue3jzidw"; // Reemplaza con tu Client ID de Twitch
const CLIENT_SECRET = "rzemvg6du8m6cptg39cdy0oflcw96b"; // Reemplaza con tu Client Secret

async function getTwitchAccessToken() {
    try {
        const response = await axios.post(`https://id.twitch.tv/oauth2/token`, null, {
            params: {
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                grant_type: "client_credentials",
            },
        });
        return response.data.access_token;
    } catch (error) {
        console.error("Error obteniendo el token de acceso:", error.response?.data || error.message);
        return null;
    }
}

async function checkTwitchStream() {
    const token = await getTwitchAccessToken();
    if (!token) return;

    try {
        const response = await axios.get(`https://api.twitch.tv/helix/streams`, {
            headers: {
                "Client-ID": CLIENT_ID,
                Authorization: `Bearer ${token}`,
            },
            params: { user_login: TWITCH_CHANNEL },
        });

        const stream = response.data.data[0];
        if (stream) {
            console.log(`${TWITCH_CHANNEL} está en vivo`);
            client.user.setPresence({
                activities: [{
                    name: stream.title,
                    type: ActivityType.Streaming,
                    url: `https://twitch.tv/${TWITCH_CHANNEL}`
                }],
                status: "online"
            });
        } else {
            console.log(`${TWITCH_CHANNEL} no está en vivo`);
            client.user.setPresence({
                activities: [{ name: "Esperando el stream 🎥", type: ActivityType.Watching }],
                status: "idle"
            });
        }
    } catch (error) {
        console.error("Error al verificar el stream de Twitch:", error.response?.data || error.message);
    }
}

client.once("ready", () => {
    console.log(`Bot conectado como ${client.user.tag}`);
    checkTwitchStream(); // Verificar al iniciar

    // Repetir cada 5 minutos (300,000 ms)
    setInterval(checkTwitchStream, 300000);
});

client.login(process.env.TOKEN);
