const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: "users-banned",
    description: "Muestra una lista de usuarios baneados en el servidor",

    async execute(client, interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            return interaction.reply({ content: "No tienes permisos para ver la lista de baneados.", ephemeral: true });
        }

        try {
            const banList = await interaction.guild.bans.fetch();
            if (banList.size === 0) {
                return interaction.reply({ content: "No hay usuarios baneados en este servidor.", ephemeral: true });
            }

            const banInfo = banList.map(ban => `**${ban.user.tag}** (ID: ${ban.user.id}) - Razón: ${ban.reason || "No especificada"}`).join("\n");
            const embed = new EmbedBuilder()
                .setTitle("Lista de Usuarios Baneados")
                .setColor("Orange")
                .setDescription(banInfo)
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: "No se pudo obtener la lista de baneados.", ephemeral: true });
        }
    }
};
