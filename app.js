// Loading modules
const express = require('express');
const handlebars = require('express-handlebars');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');

// Loading models
require('./models/Post');
const Post = mongoose.model('posts');
require('./models/Category');
const Category = mongoose.model('categories');

const app = express();

// Configuration
	// Session
app.use(session({
	secret: 'snb-blog',
	resave: true,
	saveUninitialized: true,
}));
app.use(flash());
	// Middleware
app.use((req, res, next) => {
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	next();
});
	// Express
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
	// Handlebars
app.engine('handlebars', handlebars({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
	// Mongoose
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/node-blog', {
	useNewUrlParser: true,
	useUnifiedTopology: true,
}).then(() => {
		console.log('Successfully connected to database');
	})
	.catch(err => {
		console.log(`Failed to connect to database: ${err}`);
	});

	//public
app.use(express.static(path.join(/*__dirname stores the absolute path of the project*/__dirname, 'public')));

// Routes
const admin = require('./routes/admin');
const { post } = require('./models/Post');

app.get('/', async (req, res) => {
	try {
		const posts = await Post.find().populate('category').sort({date: 'desc'});
		res.render('index', { posts: posts.map(e => e.toJSON()) });
	} catch (err) {
		req.flash('error_msg', 'An internal error ocurred!');
		res.redirect('/404');
	}
});

app.get('/post/:slug', async (req, res) => {
	const { slug } = req.params;
	try {
		const post = await Post.findOne({slug})
		
		if (post) res.render('post/index', {post: post.toJSON()});
		else {
			req.flash('error_msg', 'This post does not exists!');
			res.redirect('/');
		}

	} catch (err) {
		req.flash('error_msg', 'An internal error occurred!');
		res.redirect('/');
	}
});

app.get('/categories', async (req, res) => {
	try { 
		const categories = await Category.find();
		res.render('categories/index', {categories: categories.map(e => e.toJSON())});
	} catch (err) {
		req.flash('error_msg', 'An internal error occurred when listing categories!');
		res.redirect('/');
	}
});

app.get('/categories/:slug', async (req, res) => {
	const { slug } = req.params;
	
	try {
		const category = await Category.findOne({slug});
		
		if (category) {
			try {
				const posts = await Post.find({category: category._id});
				res.render('categories/posts', { 
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

app.use('/admin', admin);

app.get('/404', (req, res) => {
	res.send('Error: 404!');
});

// Others
const PORT = 8081;
app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});