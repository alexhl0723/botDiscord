const { EmbedBuilder } = require("discord.js");

module.exports = {
	name: "setimagen", // Nombre del comando
	description: "Ponga una imagen animada",
	options: [
		{
			name: "imagen",
			description: "Selecciona la imagen",
			type: 11, // Attachment
			required: true,
		},
	],

	async execute(client, interaction) {
		const owner = "494324902871040000";
		if (interaction.user.id !== owner) {
			return interaction.reply({
				content: "No tienes los permisos requeridos para usar este comando",
				ephemeral: true,
			});
		}

		const avatar = interaction.options.getAttachment("imagen");

		// Responder primero para que la interacción no caduque
		await interaction.deferReply({ ephemeral: true });

		try {
			// Valida el tipo de contenido (si lo deseas)
			const formatosPermitidos = [
				"image/png",
				"image/jpeg",
				"image/webp",
				"image/gif",
			];
			if (!formatosPermitidos.includes(avatar.contentType)) {
				return interaction.editReply({
					content:
						"Formato no compatible. Usa PNG, JPG, WEBP o GIF (requiere Nitro).",
				});
			}

			// Cambia el avatar del bot
			await client.user.setAvatar(avatar.url);

			// Edita la respuesta
			await interaction.editReply({
				content: "La imagen ha sido cargada con éxito",
			});
		} catch (error) {
			console.error(error);
			await interaction.editReply({
				content:
					"Hubo un error al cambiar la imagen. Asegúrate de que el formato sea válido y que tengas Nitro si es GIF.",
			});
		}
	},
};
