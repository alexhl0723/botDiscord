const { EmbedBuilder } = require("discord.js"); //Requerimos los paquetes

module.exports = {
	name: "8ball", //Nombre del comando
	description: "Hazle preguntas al bot", //Descripción del comando
	options: [
		{
			name: "pregunta",
			description: "Hazle una pregunta al bot",
			type: 3,
			require: true,
		},
	],

	async execute(client, interaction) {
		const pgr = interaction.options.getString("pregunta");

		const respuestas = [
			"si O.O",
			"No ojo",
			"Puede ser O.O",
			"Porsupuesto",
			"Probablemente",
            "Probablemente no",
		];

		const botrespuesta =
			respuestas[Math.floor(Math.random() * respuestas.length)];

		const embed = new EmbedBuilder()
			.setColor("Green")
			.setDescription(
				`🎱 | Pregunta para: ${client.user.username}\n\n**🎱 | Pregunta:** ${pgr}\n\n**🎱 | Respuesta:**
                ${botrespuesta}`,
			);

		interaction.reply({ embeds: [embed] });
	},
};
