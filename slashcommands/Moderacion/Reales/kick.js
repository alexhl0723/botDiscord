const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const Kicks = require("../../../Schemas/Configuraciones/kicks/Kicks");

module.exports = {
    name: "kick",
    description: "Expulsa a un usuario del servidor",
    options: [
        {
            name: "usuario",    
            description: "Menciona al usuario que quieres expulsar",
            type: 6,
            required: true
        },
        {
            name: "razon",
            description: "Razón de la expulsión",
            type: 3,
            required: false
        }
    ],

    async execute(client, interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
            return interaction.reply({ content: "❌ | No tienes permisos para expulsar usuarios.", ephemeral: true });
        }

        const usuario = interaction.options.getUser("usuario");
        const razon = interaction.options.getString("razon") || "No especificada";

        if (!usuario) {
            return interaction.reply({ content: "❌ | Debes mencionar a un usuario para expulsar.", ephemeral: true });
        }

        try {
            const targetMember = await interaction.guild.members.fetch(usuario.id).catch(() => null);
            
            if (!targetMember) {
                return interaction.reply({ content: "❌ | No se pudo encontrar a ese usuario en el servidor.", ephemeral: true });
            }

            // Verificar si el bot tiene permisos para expulsar
            if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.KickMembers)) {
                return interaction.reply({ content: "❌ | No tengo permisos para expulsar usuarios.", ephemeral: true });
            }
            
            // Verificar si el usuario objetivo tiene una posición superior
            if (targetMember.roles.highest.position >= interaction.member.roles.highest.position && 
                interaction.user.id !== interaction.guild.ownerId) {
                return interaction.reply({ content: "❌ | No puedes expulsar a alguien que tiene un rol igual o superior al tuyo.", ephemeral: true });
            }
            
            // Verificar si el bot puede expulsar al usuario objetivo
            if (targetMember.roles.highest.position >= interaction.guild.members.me.roles.highest.position) {
                return interaction.reply({ content: "❌ | No puedo expulsar a alguien con un rol superior al mío.", ephemeral: true });
            }
            
            // No permitir expulsar al dueño del servidor
            if (usuario.id === interaction.guild.ownerId) {
                return interaction.reply({ content: "❌ | No puedes expulsar al dueño del servidor.", ephemeral: true });
            }
            
            if (!targetMember.kickable) {
                return interaction.reply({ content: "❌ | No puedo expulsar a este usuario por alguna razón. Revisa mis permisos.", ephemeral: true });
            }

            // Guardar el kick en la base de datos (solo una vez)
            await new Kicks({
                ServerID: interaction.guild.id,
                UserID: usuario.id,
                Razon: razon
            }).save();

            // Expulsar al usuario
            await targetMember.kick(razon);
            
            // Crear y enviar el embed
            const embed = new EmbedBuilder()
                .setTitle("Usuario Expulsado")
                .setColor("Orange")
                .setDescription(`**Usuario:** ${usuario.tag} (${usuario.id})\n**Razón:** ${razon}`)
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: `❌ | Ocurrió un error al intentar expulsar al usuario: ${error.message}`, ephemeral: true });
        }
    }
};