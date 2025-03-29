const { EmbedBuilder, ButtonStyle, ActionRowBuilder, SlashCommandBuilder, ButtonBuilder } = require('discord.js');

module.exports = {
    name: 'redes',
    description: 'Redes sociales personales y del servidor.',
    data: new SlashCommandBuilder()
        .setName('redes')
        .setDescription('Redes sociales personales y del servidor.'),
    
    async execute(client, interaction) {
        try {
            // Crear botones con links
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel("Servidor discord")
                        .setStyle(ButtonStyle.Link)
                        .setURL('https://discord.gg/vgcw6TTxF6'),
                    new ButtonBuilder()
                        .setLabel("Steam")
                        .setStyle(ButtonStyle.Link)
                        .setURL("https://steamcommunity.com"),
                    new ButtonBuilder()
                        .setLabel("Instagram")
                        .setStyle(ButtonStyle.Link)
                        .setURL("https://instagram.com"),
                    new ButtonBuilder()
                        .setLabel("Facebook")
                        .setStyle(ButtonStyle.Link)
                        .setURL("https://facebook.com")
                );

            // Crear un embed simple sin necesidad de la imagen generada
            const mainPage = new EmbedBuilder()
                .setAuthor({ name: 'Redes sociales del servidor', iconURL: client.user.displayAvatarURL() })
                .setThumbnail(client.user.displayAvatarURL())
                .setColor(0x48FC08)
                .setTitle('Nuestras redes sociales')
                .setDescription('Aquí tienes enlaces a todas nuestras redes sociales. ¡Síguenos para estar al día!')
                .addFields([
                    { name: 'Link invitación del servidor', value: `[Únete a nuestra comunidad](https://discord.gg/vgcw6TTxF6)` },
                    { name: '¿Quieres más información?', value: 'Haz clic en los botones de abajo para visitar nuestras redes' }
                ])
                .setFooter({ text: 'Gracias por ser parte de nuestra comunidad' })
                .setTimestamp();

            // Responder con el embed y los botones
            await interaction.reply({ embeds: [mainPage], components: [row] });
            
        } catch (error) {
            console.error('Error en el comando redes:', error);
            // Manejar el error
            await interaction.reply({ 
                content: 'Hubo un error al mostrar las redes sociales.', 
                ephemeral: true 
            });
        }
    }
};