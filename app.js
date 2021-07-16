// Loading modules
	// Third party modules
const express = require('express');
const handlebars = require('express-handlebars');
const session = require('express-session');
const flash = require('connect-flash');
const mongoose = require('mongoose');
const passport = require('passport');
const path = require('path');
const app = express();
	// Authentication 
require('./config/auth')(passport);
	// Routes
const appRouter = require('./routes/app');
const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');

// Configuration
	// Session
app.use(session({
	secret: 'snb-blog',
	resave: true,
	saveUninitialized: true,
}));
	// Passport (is important that it is between Session and Flash)
app.use(passport.initialize());
app.use(passport.session());
	// Flash
app.use(flash());
	// Middleware
app.use((req, res, next) => {
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error');
	res.locals.user = req.user || null;
	next();
});
	// Express
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
	// Handlebars
app.engine('handlebars', handlebars({ 
	helpers: require('./views/helpers/handlebars').helpers,
	defaultLayout: 'main', 
}));
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
app.use('/', appRouter);
app.use('/admin', adminRouter);
app.use('/user', userRouter);

// Others
const PORT = 8081;

app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});