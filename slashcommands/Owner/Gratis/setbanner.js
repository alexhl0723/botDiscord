module.exports = {
	name: "setbanner",
	description: "Ponga un banner a su bot",
	options: [
		{
			name: "banner",
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

		const banner = interaction.options.getAttachment("banner");

		// Responder primero para evitar expiración de la interacción
		await interaction.deferReply({ ephemeral: true });

		// Validar el tipo de contenido (opcional)
		const formatosPermitidos = [
			"image/png",
			"image/jpeg",
			"image/webp",
			"image/gif",
		];
		if (!formatosPermitidos.includes(banner.contentType)) {
			return interaction.editReply({
				content:
					"Formato no compatible. Usa PNG, JPG, WEBP o GIF (GIF requiere Nitro).",
			});
		}

		try {
			const response = await fetch(banner.url);
			if (!response.ok) throw new Error("Error al obtener la imagen");

			// Utiliza arrayBuffer() en lugar de buffer()
			const arrayBuffer = await response.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);
			const base64 = buffer.toString("base64");
			const imageData = `data:${banner.contentType};base64,${base64}`;

			const apiResponse = await fetch("https://discord.com/api/v10/users/@me", {
				method: "PATCH",
				headers: {
					Authorization: `Bot ${client.token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ banner: imageData }),
			});

			if (!apiResponse.ok) {
				throw new Error(`Error de API: ${await apiResponse.text()}`);
			}

			await interaction.editReply({
				content: "El banner ha sido cambiado con éxito",
			});
		} catch (error) {
			console.error(error);
			await interaction.editReply({
				content:
					"Hubo un error al cambiar el banner. Revisa la consola para más detalles.",
			});
		}
	},
};
