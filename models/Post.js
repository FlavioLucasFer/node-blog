const { Schema, model } = require('mongoose');

const Post = new Schema({
	title: {
		type: String,
		required: true,
	},
	slug: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
	contents: {
		type: String,
		required: true,
	},
	category: {
		type: Schema.Types.ObjectId,
		ref: 'categories',
		required: true,
	},
	date: {
		type: Date,
		default: Date.now(),
	},
});

model('posts', Post);
