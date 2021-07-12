// Loading modules
const express = require('express');
const mongoose = require('mongoose');
require('../models/Category');

const router = express.Router();
const Category = mongoose.model('categories');

// Routes
router.get('/', (req, res) => {
	res.render('admin/index');
});

router.get('/categories', (req, res) => {
	res.render('admin/categories');
});

router.get('/categories/add', (req, res) => {
	res.render('admin/add_category');
});

router.get('/posts', (req, res) => {
	res.send("Admin posts page");
});

router.post('/categories/new', async (req, res) => {
	const { name, slug } = req.body;
	
	const newCategory = {
		name,
		slug,
	};

	try {
		await new Category(newCategory).save();
		console.log('New category successfully created!');
	} catch (err) {
		console.log(`Failed to create new category: ${err}`);
	}
});

module.exports = router;