// Loading modules
const express = require('express');
const handlebars = require('express-handlebars');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');

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

app.use('/admin', admin);

// Others
const PORT = 8081;
app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});