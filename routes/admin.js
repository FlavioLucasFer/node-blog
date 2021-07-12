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

router.get('/categories', async (req, res) => {
	try {
		const categories = await Category.find().sort({ date: 'desc' });
		res.render('admin/categories', { 
			categories: categories.map(e => e.toJSON())
		});
	} catch (err) {
		req.flash('error_msg', 'An error ocurred when listing categories');
		res.redirect('/admin');
	}
});

router.get('/categories/add', (req, res) => {
	res.render('admin/add_category');
});

router.get('/posts', (req, res) => {
	res.send("Admin posts page");
});

router.post('/categories/new', async (req, res) => {
	const { name, slug } = req.body;
	const errors = [];

	if (!name) {
		errors.push({ message: 'Name is mandatory' });
	} 
	
	if (!slug) {
		errors.push({ message: 'Slug is mandatory' });
	}

	if (errors.length > 0) {
		res.render('admin/add_category', { errors });
	} else {
		const newCategory = {
			name,
			slug,
		};
	
		try {
			await new Category(newCategory).save();
			req.flash('success_msg', "New category successfully created!");
			res.redirect('/admin/categories');
		} catch (err) {
			req.flash('error_msg', 'An error occurred when creating new category. Try again!');
			res.redirect('/admin');
		}
	}
});

module.exports = router;