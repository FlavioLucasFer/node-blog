const { Schema, model } = require('mongoose');

const User = new Schema({
	name: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
	},
	password: {
		type: String,
		required: true,
	},
	type: {
		type: String,
		default: 'N', // N = Normal User || A = Admin
	},
});

model('users', User);

module.exports = User;