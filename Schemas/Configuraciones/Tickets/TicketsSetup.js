const { model, Schema } = require("mongoose");

const setup = new Schema({
	ServerID: {
		type: String,
		required: true,
	},
	CanalID: {
		type: String,
		required: true,
	},
	CategoriaID: {
		type: String,
		required: true,
	},
	RolID: {
		type: String,
		required: true,
	},
});
//alex recuerda poner en la db los baneados
module.exports = model("TicketsSetup", setup);