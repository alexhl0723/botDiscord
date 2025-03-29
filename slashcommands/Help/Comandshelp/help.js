const { EmbedBuilder } = require("discord.js");
const { filterCommandsByPermission } = require("../../../handlers/slashHandler");

module.exports = {
    name: "comandos",
    description: "Muestra los comandos disponibles para ti",
    
    async execute(client, interaction, args) {
        // Obtener comandos disponibles para este usuario
        const comandosDisponibles = filterCommandsByPermission(client, interaction.member);
        
        // Crear un embed con la lista de comandos
        const embed = new EmbedBuilder()
            .setColor("#0099ff")
            .setTitle("📋 Comandos Disponibles")
            .setDescription("Estos son los comandos que puedes usar:")
            .setTimestamp()
            .setFooter({ 
                text: `Solicitado por ${interaction.user.tag}`, 
                iconURL: interaction.user.displayAvatarURL() 
            });
        
        // Mapa para agrupar comandos por categoría
        const categorias = {};
        
        comandosDisponibles.forEach(cmd => {
            // Usar la ruta de categoría que guardamos en el handler
            const categoria = cmd.categoryPath || "General";
            
            if (!categorias[categoria]) {
                categorias[categoria] = [];
            }
            
            categorias[categoria].push(`\`/${cmd.name}\` - ${cmd.description}`);
        });
        
        // Añadir campos al embed para cada categoría
        for (const [categoria, comandos] of Object.entries(categorias)) {
            if (comandos.length > 0) {
                embed.addFields({ 
                    name: `${categoria} (${comandos.length})`, 
                    value: comandos.join('\n') 
                });
            }
        }
        
        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};