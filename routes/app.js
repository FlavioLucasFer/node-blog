// Loading modules
	// Third party modules
const { Router } = require('express');
const { model } = require('mongoose');

const router = Router();
	// Models
require('../models/Post');
require('../models/Category');

const Post = model('posts');
const Category = model('categories');

// Constants to stores URLs of routes
const POST = '/post';
const CATEGORIES = '/categories';
const ERROR = '/404';

// Routes 
	// Route to render view of posts 
router.get('/', async (req, res) => {
	try {
		const posts = await Post.find().populate('category').sort({date: 'desc'});
		res.render('index', {
			postRoute: POST, 
			posts: posts.map(e => e.toJSON()),
		});
	} catch (err) {
		req.flash('error_msg', 'An internal error ocurred!');
		res.redirect(ERROR);
	}
});

	// Route to render view of post 
router.get(`${POST}/:slug`, async (req, res) => {
	const { slug } = req.params;

	try {
		const post = await Post.findOne({slug})

		if (post) 
			res.render('post/index', {
				route: POST, 
				post: post.toJSON(),
			});
		else {
			req.flash('error_msg', 'This post does not exists!');
			res.redirect('/');
		}

	} catch (err) {
		req.flash('error_msg', 'An internal error occurred!');
		res.redirect('/');
	}
});

	// Route to render view of categories
router.get(CATEGORIES, async (req, res) => {
	try {
		const categories = await Category.find();
		res.render('categories/index', {
			route: CATEGORIES, 
			categories: categories.map(e => e.toJSON()),
		});
	} catch (err) {
		req.flash('error_msg', 'An internal error occurred when listing categories!');
		res.redirect('/');
	}
});

	// Route to render view of category 
router.get(`${CATEGORIES}/:slug`, async (req, res) => {
	const { slug } = req.params;

	try {
		const category = await Category.findOne({slug});

		if (category) {
			try {
				const posts = await Post.find({category: category._id});
				res.render('categories/posts', {
					postRoute: POST,
					category: category.toJSON(),
					posts: posts.map(e => e.toJSON()),
				});
			} catch (err) {
				req.flash('error_msg', 'An error occurred when list the posts of this category');
				res.redirect('/categories');
			}
		}
		else {
			req.flash('error_msg', 'This category does not exists!');
			res.redirect('/');
		}
	} catch (err) {
		req.flash('error_msg', 'An internal error occurred when load the page of this category!');
		res.redirect('/');
	}
});

	// Route to render view of error 
router.get(ERROR, (req, res) => {
	res.send('Error: 404!');
});

module.exports = router;