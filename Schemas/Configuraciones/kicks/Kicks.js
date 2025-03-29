const { model, Schema } = require("mongoose");

const kick = new Schema({
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

module.exports = model("Kicks", kick);
