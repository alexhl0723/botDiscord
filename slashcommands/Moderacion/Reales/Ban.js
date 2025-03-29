const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const Baneos = require("../../../Schemas/Configuraciones/baneos/Baneos");

module.exports = {
    name: "ban",
    description: "Banea a un usuario",
    options: [
        {
            name: "usuario",
            description: "Menciona al usuario que quieres banear",
            type: 6,
            required: false
        },
        {
            name: "id",
            description: "Escribe la ID del usuario que quieres banear",
            type: 3,
            required: false
        },
        {
            name: "razon",
            description: "Escribe la razón del baneo",
            type: 3,
            required: false
        }
    ],

    async execute(client, interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            return interaction.reply({ content: "No tienes permisos para banear usuarios.", ephemeral: true });
        }

        const usuario = interaction.options.getUser("usuario");
        const id = interaction.options.getString("id");
        const razon = interaction.options.getString("razon") || "No especificada";

        if (!usuario && !id) {
            return interaction.reply({ content: "Debes proporcionar un usuario o una ID para banear.", ephemeral: true });
        }

        try {
            const userID = usuario ? usuario.id : id;
            const userToBan = await interaction.guild.members.fetch(userID).catch(() => null);
            
            if (!userToBan) {
                // El usuario no está en el servidor, pero aún podemos registrar el baneo
                // Continuamos con el proceso para bans de usuarios que no están en el servidor
                
                // Registrar el baneo en la base de datos
                await new Baneos({
                    ServerID: interaction.guild.id,
                    UserID: userID,
                    Razon: razon
                }).save();
                
                await interaction.guild.members.ban(userID, { reason: razon });

                const embed = new EmbedBuilder()
                    .setTitle("Usuario Baneado")
                    .setColor("Red")
                    .setDescription(`**Usuario:** ID: ${userID}\n**Razón:** ${razon}`)
                    .setTimestamp();

                return interaction.reply({ embeds: [embed] });
            }

            if (!userToBan.bannable) {
                return interaction.reply({ content: "No puedo banear a este usuario. Puede que tenga un rol más alto o permisos especiales.", ephemeral: true });
            }

            // Registrar el baneo en la base de datos
            await new Baneos({
                ServerID: interaction.guild.id,
                UserID: userToBan.id,
                Razon: razon
            }).save();

            await userToBan.ban({ reason: razon });
            
            const embed = new EmbedBuilder()
                .setTitle("Usuario Baneado")
                .setColor("Red")
                .setDescription(`**Usuario:** ${userToBan.user.tag} (${userToBan.id})\n**Razón:** ${razon}`)
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: `Ocurrió un error al intentar banear al usuario: ${error.message}`, ephemeral: true });
        }
    }
};