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

router.get('/categories/edit/:id', async (req, res) => {
	const { id } = req.params;
	try {
		const category = await Category.findOne({_id: id});
		res.render('admin/edit_category', { 
			category: category.toJSON(), 
		});
	} catch (err) {
		req.flash('error_msg', "This category does not exits!");
		res.redirect('/admin/categories');
	}
});

router.post('/categories/edit', async (req, res) => {
	const { id, name, slug } = req.body;
	const errors = [];

	if (!name) {
		errors.push({ message: 'Name is mandatory!' });
	}

	if (!slug) {
		errors.push({ message: 'Slug is mandatory!' });
	}

	if (errors.length > 0) {
		res.render('admin/edit_category');
	} else {
		try {
			const category = await Category.findOne({ _id: id });
			
			category.name = name;
			category.slug = slug;
			
			await category.save();
			
			req.flash('success_msg', 'Category successfuly edited!');
			res.redirect('/admin/categories');
		} catch (err) {
			req.flash('error_msg', 'An error ocurred when editing category!');
			res.redirect('/admin/categories');
		}
	}
});

router.post('/categories/delete', async (req, res) => {
	const { id } = req.body;
	
	try {
		await Category.remove({ _id: id });
		req.flash('success_msg', 'Category successfully deleted!');
		res.redirect('/admin/categories');
	} catch (err) {
		req.flash('error_msg', 'An error ocurred when deleting category!');
		res.redirect('/admin/categories');
	}
});

router.get('/posts', (req, res) => {
	res.send("Admin posts page");
});

module.exports = router;