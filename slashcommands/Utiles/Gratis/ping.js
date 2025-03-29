const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'ping',
    description: 'Muestra la latencia del bot y API de Discord',
    cooldown: 5, // Cooldown de 5 segundos para evitar spam
    
    async execute(client, interaction) {
        try {
            // Deferred reply para tener tiempo de procesar
            await interaction.deferReply();
            
            // Cálculo de ping del bot (latencia del cliente)
            const botPing = Date.now() - interaction.createdTimestamp;
            
            // Obtener ping de la API de Discord
            const apiPing = Math.round(client.ws.ping);
            
            // Obtener información de la conexión del usuario
            const userPing = interaction.member?.voice?.channel ? 
                interaction.member.voice.selfDeaf ? "Desactivado" : `${interaction.member.voice.ping}ms` : 
                "No está en un canal de voz";
            
            // Determinar calidad de la conexión para el color del embed
            let color = 'Green';
            let status = '¡Excelente!';
            
            if (apiPing > 200) {
                color = 'Yellow';
                status = 'Normal';
            }
            
            if (apiPing > 400) {
                color = 'Red';
                status = 'Inestable';
            }
            
            // Crear un embed más detallado
            const embed = new EmbedBuilder()
                .setColor(color)
                .setTitle('🏓 Pong!')
                .setDescription(`**Estado de la conexión:** ${status}`)
                .addFields(
                    { name: '📶 Latencia del Bot', value: `${botPing}ms`, inline: true },
                    { name: '🌐 Latencia de la API', value: `${apiPing}ms`, inline: true },
                    { name: '👤 Conexión del Usuario', value: `${userPing}`, inline: true },
                    { name: '⏰ Uptime', value: formatUptime(client.uptime), inline: false }
                )
                .setFooter({ text: 'Tiempo de respuesta medido desde el momento de la solicitud' })
                .setTimestamp();
            
            // Enviar el embed como respuesta
            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Error en el comando ping:', error);
            
            // Manejo de errores para el usuario
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ 
                    content: 'Hubo un error al procesar el comando de ping. Por favor, intenta más tarde.', 
                    ephemeral: true 
                });
            } else {
                await interaction.editReply({ 
                    content: 'Hubo un error al procesar el comando de ping. Por favor, intenta más tarde.' 
                });
            }
        }
    }
};

/**
 * Formatea el tiempo de actividad del bot en un formato legible
 * @param {number} uptime - Tiempo en milisegundos
 * @returns {string} Tiempo formateado
 */
function formatUptime(uptime) {
    const days = Math.floor(uptime / 86400000);
    const hours = Math.floor((uptime % 86400000) / 3600000);
    const minutes = Math.floor((uptime % 3600000) / 60000);
    const seconds = Math.floor((uptime % 60000) / 1000);
    
    const parts = [];
    if (days > 0) parts.push(`${days} día${days !== 1 ? 's' : ''}`);
    if (hours > 0) parts.push(`${hours} hora${hours !== 1 ? 's' : ''}`);
    if (minutes > 0) parts.push(`${minutes} minuto${minutes !== 1 ? 's' : ''}`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds} segundo${seconds !== 1 ? 's' : ''}`);
    
    return parts.join(', ');
}