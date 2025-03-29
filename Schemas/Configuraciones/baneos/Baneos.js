const { model, Schema } = require("mongoose");

const baneo = new Schema({
	ServerID: {
		type: String,
		required: true,
	},
	UserID: {
		type: String,
		required: true,
	},
	Razon: {
		type: String,
		required: true,
	},
});

module.exports = model("Baneos", baneo);
