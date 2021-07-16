// Loading modules
	// Third party modules
const { Router } = require('express');
const { model } = require('mongoose');

const router = Router();
	// Models
require('../models/Category');
require('../models/Post');

const Category = model('categories');
const Post = model('posts');
	// Helpers
const isAdmin = require('../helpers/isAdmin');

// Constants to stores URLs of routes
const INDEX_ROUTE = '/admin';
const CATEGORIES = '/categories';
const NEW_CATEGORY = `${CATEGORIES}/new`;
const EDIT_CATEGORY = `${CATEGORIES}/edit`;
const DELETE_CATEGORY = `${CATEGORIES}/delete`;
const POSTS = '/posts';
const NEW_POST = `${POSTS}/new`;
const EDIT_POST = `${POSTS}/edit`;
const DELETE_POST = `${POSTS}/delete`;

// Routes of type GET
router.get('/', isAdmin, (req, res) => {
	res.render('admin/index', {
		adminRoute: INDEX_ROUTE,
		categoriesRoute: CATEGORIES,
		postsRoute: POSTS,
	});
});

	// Route to render view of categories
router.get(CATEGORIES, isAdmin, async (req, res) => {
	try {
		const categories = await Category.find().sort({date: 'desc'});
		
		res.render('admin/categories', { 
			adminRoute: INDEX_ROUTE,
			newCategoryRoute: NEW_CATEGORY,
			editCategoryRoute: EDIT_CATEGORY,
			deleteCategoryRoute: DELETE_CATEGORY,
			categories: categories.map(e => e.toJSON()),
		});
	} catch (err) {
		req.flash('error_msg', 'An error ocurred when listing categories');
		res.redirect(INDEX_ROUTE);
	}
});

	// Route to render view for add new category
router.get(NEW_CATEGORY, isAdmin, (req, res) => {
	res.render('admin/add_category', {
		adminRoute: INDEX_ROUTE,
		newCategoryRoute: NEW_CATEGORY,
	});
});

	// Route to render view for edit a category
router.get(`${EDIT_CATEGORY}/:id`, isAdmin, async (req, res) => {
	const { id } = req.params;
	try {
		const category = await Category.findOne({_id: id});
		res.render('admin/edit_category', { 
			adminRoute: INDEX_ROUTE,
			editCategoryRoute: EDIT_CATEGORY,
			category: category.toJSON(), 
		});
	} catch (err) {
		req.flash('error_msg', "This category does not exits!");
		res.redirect(INDEX_ROUTE + CATEGORIES);
	}
});

	// Route to render view of posts
router.get(POSTS, isAdmin, async (req, res) => {
	try {
		const posts = await Post.find().populate('category').sort({date: 'desc'});
		
		res.render('admin/posts', {
			adminRoute: INDEX_ROUTE,
			newPostRoute: NEW_POST,
			editPostRoute: EDIT_POST,
			deletePostRoute: DELETE_POST,
			posts: posts.map(e => e.toJSON()),
		});
	} catch (err) {
		req.flash('error_msg', 'An error ocurred when listing posts');
		res.redirect(INDEX_ROUTE);
	}
});

	// Route to render view for add new post
router.get(NEW_POST, isAdmin, async (req, res) => {
	try {
		const categories = await Category.find();
		
		res.render('admin/add_post', {
			adminRoute: INDEX_ROUTE,
			newPostRoute: NEW_POST,
			categories: categories.map(e => e.toJSON()),
		});
	} catch (err) {
		req.flash('error_msg', 'An error ocurred when load form');
		res.redirect(INDEX_ROUTE);
	}
});

	// Route to render view for edit a post
router.get(`${EDIT_POST}/:id`, isAdmin, async (req, res) => {
	const { id } = req.params;

	try {
		const post = await Post.findOne({_id: id});
		const categories = await Category.find();

		res.render('admin/edit_post', {
			adminRoute: INDEX_ROUTE,
			editPostRoute: EDIT_POST,
			post: post.toJSON(),
			categories: categories.map(e => e.toJSON()),
		});
	} catch (err) {
		req.flash('error_msg', 'An error ocurred when editing post!');
		res.redirect(INDEX_ROUTE + POSTS);
	}
});

	// Route to render view for delete a post
router.get(`${DELETE_POST}/:id`, isAdmin, async (req, res) => {
	const { id } = req.params;

	try {
		await Post.remove({_id: id});

		req.flash('success_msg', 'Post successfully deleted!');
		res.redirect(INDEX_ROUTE + POSTS);
	} catch (err) {
		req.flash('error_msg', 'An error ocurred when deleting post!');
		res.redirect(INDEX_ROUTE + POSTS);
	}
});



// Routes of type POST
	// Route for create new category
router.post(NEW_CATEGORY, isAdmin, async (req, res) => {
	const { name, slug } = req.body;
	const errors = [];

	if (!name) {
		errors.push({message: 'Name is mandatory'});
	}

	if (!slug) {
		errors.push({message: 'Slug is mandatory'});
	}

	if (errors.length > 0) {
		res.render('admin/add_category', {
			adminRoute: INDEX_ROUTE,
			newCategoryRoute: NEW_CATEGORY,
			errors,
		});
	} else {
		try {
			await new Category({
				name,
				slug,
			}).save();

			req.flash('success_msg', "New category successfully created!");
			res.redirect(INDEX_ROUTE + CATEGORIES);
		} catch (err) {
			req.flash('error_msg', 'An error occurred when creating new category. Try again!');
			res.redirect(INDEX_ROUTE);
		}
	}
});

	// Route for edit a category
router.post(EDIT_CATEGORY, isAdmin, async (req, res) => {
	const { id, name, slug } = req.body;
	const errors = [];

	if (!name) {
		errors.push({message: 'Name is mandatory!'});
	}

	if (!slug) {
		errors.push({message: 'Slug is mandatory!'});
	}

	if (errors.length > 0) {
		res.render('admin/edit_category', {
			adminRoute: INDEX_ROUTE,
			editCategoryRoute: EDIT_CATEGORY,
		});
	} else {
		try {
			const category = await Category.findOne({_id: id});

			category.name = name;
			category.slug = slug;

			await category.save();

			req.flash('success_msg', 'Category successfuly edited!');
			res.redirect(INDEX_ROUTE + CATEGORIES);
		} catch (err) {
			req.flash('error_msg', 'An error ocurred when editing category!');
			res.redirect(INDEX_ROUTE + CATEGORIES);
		}
	}
});

	// Route for delete a category 
router.post(DELETE_CATEGORY, isAdmin, async (req, res) => {
	const { id } = req.body;
	
	try {
		await Category.remove({_id: id});
		req.flash('success_msg', 'Category successfully deleted!');
		res.redirect(INDEX_ROUTE + CATEGORIES);
	} catch (err) {
		req.flash('error_msg', 'An error ocurred when deleting category!');
		res.redirect(INDEX_ROUTE + CATEGORIES);
	}
});


	// Route for create new post
router.post(NEW_POST, isAdmin, async (req, res) => {
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
		res.render('admin/add_post', { 
			adminRoute: INDEX_ROUTE,
			newPostRoute: NEW_POST,
			errors,
		});
	} else {

		try {
			await new Post({
				title,
				slug,
				description,
				contents,
				category,
			}).save();
			req.flash('success_msg', 'New post successfully created!');
			res.redirect(INDEX_ROUTE + POSTS);
		} catch (err) {
			req.flash('error_msg', 'An error ocurred when saving post!');
			res.redirect(INDEX_ROUTE + POSTS);
		}
	}
});

	// Route for edit a post
router.post(EDIT_POST, isAdmin, async (req, res) => {
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
		res.render('admin/add_post', { 
			adminRoute: INDEX_ROUTE,
			newPostRoute: NEW_POST,
			errors,
		});
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
			res.redirect(INDEX_ROUTE + POSTS);
		} catch (err) {
			req.flash('error_msg', 'An error ocurred when saving edit');
			res.redirect(INDEX_ROUTE + POSTS);
		}
	}
});

module.exports = router;