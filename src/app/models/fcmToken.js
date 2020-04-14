const mongoose = require('../../database');

const Schema = mongoose.Schema;

const FCMTokenSchema = new mongoose.Schema({
	user: {
        type: Schema.Types.ObjectId, 
        ref: "User", 
        unique: true
	},
	token: {
		type: String,
		required: true,
	},
	is_accepted: {
		type: Boolean,
		default: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

const FCMToken = mongoose.model('FCMToken', FCMTokenSchema);

module.exports = FCMToken;