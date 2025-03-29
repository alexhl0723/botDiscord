const { EmbedBuilder, AttachmentBuilder } = require("discord.js");//Requerimos los paquetes
const Canvas = require("canvas");
const path = require("path");
const fs = require("fs");

module.exports = {
	name: "guildMemberAdd",//Nombre del evento

	async execute(member, client){
		// Verificar si es el servidor correcto
		if(member.guild.id === "760216678633046066"){
			try {
				// Verificar si existe la carpeta de fuentes
				const fontPath = path.join(process.cwd(), "Fuentes", "gideon-roman_5.2.5", "ttf", "gideon-roman-latin-400-normal.ttf");
				
				// Registrar la fuente de forma segura
				try {
					Canvas.registerFont(fontPath, { family: "gideon" });
					console.log("Fuente registrada con éxito");
				} catch (fontError) {
					console.error("Error al registrar la fuente:", fontError);
					// Continuar sin la fuente personalizada si hay error
				}
				
				// Crear canvas
				const canvas = Canvas.createCanvas(922, 450);
				const ctx = canvas.getContext("2d");
				
				// Cargar imagen de fondo
				const background = await Canvas.loadImage("https://c4.wallpaperflare.com/wallpaper/923/685/115/violet-evergarden-anime-girls-violet-evergarden-anime-water-wallpaper-preview.jpg")
					.catch(err => {
						console.error("Error al cargar la imagen de fondo:", err);
						throw new Error("No se pudo cargar la imagen de fondo");
					});
				
				// Cargar avatar
				const avatar = await Canvas.loadImage(member.user.displayAvatarURL({ extension: "jpg", forceStatic: true }))
					.catch(err => {
						console.error("Error al cargar el avatar:", err);
						throw new Error("No se pudo cargar el avatar del usuario");
					});

				//Imagen del fondo
				ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

				//Avatar y el contorno
				ctx.save();
				ctx.beginPath();
				ctx.arc(461, 154, 116, 0, Math.PI * 2, true);
				ctx.closePath();
				ctx.clip();
				ctx.drawImage(avatar, 345, 38, 232, 232);
				ctx.strokeStyle = "white";
				ctx.lineWidth = 14;
				ctx.stroke();
				ctx.restore();

				//Texto de bienvenida (usando try/catch por si la fuente falla)
				try {
					ctx.font = "50px gideon";
				} catch (e) {
					console.log("Usando fuente fallback para títulos");
					ctx.font = "50px Arial";
				}
				ctx.fillStyle = "white";
				ctx.textAlign = "center";
				ctx.fillText(`BIENVENIDO`, 461, 324);

				//Texto de bienvenida (usuario)
				try {
					ctx.font = "30px gideon";
				} catch (e) {
					ctx.font = "30px Arial";
				}
				ctx.fillStyle = "white";
				ctx.textAlign = "center";
				ctx.fillText(`${member.user.tag}`, 461, 360);

				//Texto 2
				ctx.fillText(`ERES UN MIEMBRO MAS`, 461, 392);

				// Crear buffer de imagen
				const buffer = canvas.toBuffer("image/jpeg");
				
				// Crear attachment
				const imagen = new AttachmentBuilder(buffer, { name: "card.jpg" });
				
				// Enviar mensaje
				const bienvenidaChannel = client.channels.cache.get("1345547716259741740");
				if (bienvenidaChannel) {
					await bienvenidaChannel.send({ 
						content: `¡Bienvenido/a <@${member.id}>! Espero que disfrutes del servidor ❤`, 
						files: [imagen] 
					});
					console.log(`Mensaje de bienvenida enviado para ${member.user.tag}`);
				} else {
					console.error("Canal de bienvenida no encontrado");
				}
			} catch (error) {
				console.error("Error en el evento de bienvenida:", error);
				
				// Si hay un error con Canvas, enviar un mensaje de bienvenida básico
				try {
					const fallbackEmbed = new EmbedBuilder()
						.setColor("#FF69B4")
						.setTitle(`¡Bienvenido/a ${member.user.username}!`)
						.setDescription(`Hola <@${member.user.id}>, ¡bienvenido/a a nuestro servidor!\nEres el miembro número **${member.guild.memberCount}**`)
						.setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 }))
						.setTimestamp();
					
					const bienvenidaChannel = client.channels.cache.get("1345547716259741740");
					if (bienvenidaChannel) {
						await bienvenidaChannel.send({ 
							content: `¡Bienvenido/a <@${member.id}>! Espero que disfrutes del servidor ❤`, 
							embeds: [fallbackEmbed] 
						});
					}
				} catch (fallbackError) {
					console.error("Error al enviar mensaje de bienvenida alternativo:", fallbackError);
				}
			}
		}
	}
}