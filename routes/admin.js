// Loading modules
const express = require('express');
const { model } = require('mongoose');
require('../models/Category');
require('../models/Post');

const router = express.Router();
const Category = model('categories');
const Post = model('posts');

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

router.get('/posts', async (req, res) => {
	try {
		const posts = await Post.find().populate('category').sort({date: 'desc'});
		res.render('admin/posts', { posts: posts.map(e => e.toJSON()) });
	} catch (err) {
		req.flash('error_msg', 'An error ocurred when listing posts');
		res.redirect('/admin');
	}
});

router.get('/posts/add', async (req, res) => {
	try {
		const categories = await Category.find();
		res.render('admin/add_post', { categories: categories.map(e => e.toJSON()) });
	} catch (err) {
		req.flash('error_msg', 'An error ocurred when load form');
		res.redirect('/admin');
	}
});

router.post('/posts/new', async (req, res) => {
	const { 
		title, 
		slug, 
		description,
		contents,
		category, 
	} = req.body;

	let errors = [];

	if (!title) 
		errors.push({message: 'Title is mandatory!'});
	
	if (!slug)
		errors.push({message: 'Slug is mandatory!'});
	
	if (!description)
		errors.push({message: 'Description is mandatory!'});

	if (!contents)
		errors.push({message: 'Contents is mandatory!'});

	if (category === '0') 
		errors.push({message: 'Invalid category, register a category!'});

	if (errors.length > 0) {
		res.render('admin/add_post', { errors });
	} else {
		const newPost = {...req.body};

		try {
			await new Post(newPost).save();
			req.flash('success_msg', 'New post successfully created!');
			res.redirect('/admin/posts');
		} catch (err) {
			req.flash('error_msg', 'An error ocurred when saving post!');
			res.redirect('/admin/posts');
		}
	}
});

router.get('/posts/edit/:id', async (req, res) => {
	const { id } = req.params;
	
	try {
		const post = await Post.findOne({_id: id })
		const categories = await Category.find();
		res.render('admin/edit_post', {
			post: post.toJSON(),
			categories: categories.map(e => e.toJSON()),
		});
	} catch (err) {
		req.flash('error_msg', 'An error ocurred when editing post!');
		res.redirect('/admin');
	}
});

router.post('/posts/edit', async (req, res) => {
	const {
		id,
		title,
		slug,
		description,
		contents,
		category,
	} = req.body;

	let errors = [];

	if (!title)
		errors.push({ message: 'Title is mandatory!' });

	if (!slug)
		errors.push({ message: 'Slug is mandatory!' });

	if (!description)
		errors.push({ message: 'Description is mandatory!' });

	if (!contents)
		errors.push({ message: 'Contents is mandatory!' });

	if (category === '0')
		errors.push({ message: 'Invalid category, register a category!' });

	if (errors.length > 0) {
		res.render('admin/add_post', { errors });
	} else {
		try {
			const post = await Post.findOne({ _id: id })
			
			post.title = title;
			post.slug = slug;
			post.description = description;
			post.contents = contents;
			post.category = category;

			await post.save();

			req.flash('success_msg', 'Post successfully edited!');
			res.redirect('/admin/posts');
		} catch (err) {
			req.flash('error_msg', 'An error ocurred when saving edit');
			res.redirect('/admin/posts');
		}
	}
});

router.get('/posts/delete/:id', async (req, res) => {
	const { id } = req.params;

	try {
		await Post.remove({_id: id});

		req.flash('success_msg', 'Post successfully deleted!');
		res.redirect('/admin/posts');
	} catch (err) {
		req.flash('error_msg', 'An error ocurred when deleting post!');
		res.redirect('/admin/posts');
	}
});

module.exports = router;