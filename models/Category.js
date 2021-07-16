const { Schema, model } = require("mongoose");

const Category = new Schema({
	name: {
		type: String,
		required: true,
	},
	slug: {
		type: String,
		required: true,
	},
	date: {
		type: Date,
		default: Date.now(),
	},
});

model('categories', Category);
