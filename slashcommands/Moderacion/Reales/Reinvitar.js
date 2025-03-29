const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: "reinvitacion-y-desban",
    description: "Desbanea a un usuario y le envía una invitación",
    options: [
        {
            name: "id",
            description: "ID del usuario que quieres desbanear e invitar",
            type: 3,
            required: true
        }
    ],

    async execute(client, interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            return interaction.reply({ content: "No tienes permisos para realizar esta acción.", ephemeral: true });
        }

        const id = interaction.options.getString("id");

        try {
            // Desbanear al usuario
            await interaction.guild.bans.remove(id);
            
            // Crear una invitación con duración de 24 horas
            const invite = await interaction.channel.createInvite({
                maxUses: 1, // Solo para este usuario
                maxAge: 86400, // Expira en 24 horas
                unique: true
            });

            // Intentar enviar la invitación por DM
            const user = await client.users.fetch(id);
            if (user) {
                await user.send(`Has sido desbaneado de **${interaction.guild.name}**. Puedes volver a unirte con este enlace: ${invite.url}`);
            }

            return interaction.reply({ content: `El usuario con ID \`${id}\` ha sido desbaneado y recibió una invitación.`, ephemeral: false });

        } catch (error) {
            console.error(error);
            return interaction.reply({ content: "No se pudo desbanear o enviar la invitación. Asegúrate de que la ID es correcta y que el usuario permite DMs.", ephemeral: true });
        }
    }
};
