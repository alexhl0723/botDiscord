const { EmbedBuilder } = require("discord.js");
const { puedeEjecutarComando } = require("../../Estructuras/Permisos");

module.exports = {
    name: "interactionCreate",
    async execute(interaction, client) {
        if (!interaction.isChatInputCommand()) return;

        const cmd = client.slashCommands.get(interaction.commandName);
        if (!cmd) {
            await interaction.reply({ content: "❌ | Este comando no está registrado.", ephemeral: true });
            return;
        }

        // Verificar permiso para ejecutar este comando
        if (!puedeEjecutarComando(interaction.member, interaction.commandName)) {
            await interaction.reply({ 
                content: "⛔ | No tienes permisos para usar este comando.", 
                ephemeral: true 
            });
            return;
        }

        const args = [];
        for (let option of interaction.options.data) {
            if (option.type === 1) { // Si es subcomando o grupo de subcomandos
                if (option.name) args.push(option.name);
                option.options?.forEach((x) => {
                    if (x.value) args.push(x.value);
                });
            } else if (option.value) {
                args.push(option.value);
            }
        }

        try {
            await cmd.execute(client, interaction, args);
        } catch (err) {
            console.error(`Error al ejecutar el comando ${interaction.commandName}:`, err);
            await interaction.reply({ content: "❌ | Ha ocurrido un error al ejecutar el comando.", ephemeral: true });
        }
    }
};