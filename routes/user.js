// Loading modules
	// Third party modules
const { Router } = require('express');
const { model } = require('mongoose');
const { genSalt, hash } = require('bcryptjs');
const passport = require('passport');

const router = Router();
	// Models
require('../models/User');

const User = model('users');

// Constants to stores URLs of routes
const INDEX_ROUTE = '/user';
const CREATE_ACCOUNT = '/create-account';
const LOGIN = '/login';
const LOGOUT = '/logout';

// Routes of type GET
	// Route to render view for create an account
router.get(CREATE_ACCOUNT, (req, res) => {
	res.render('user/register', {
		userRoute: INDEX_ROUTE,
		createAccountRoute: CREATE_ACCOUNT,
	});
});

	// Route to render view for login
router.get(LOGIN, (req, res) => {
	res.render('user/login', {
		userRoute: INDEX_ROUTE,
		loginRoute: LOGIN,
	});
});

	// Route for logout
router.get(LOGOUT, (req, res) => {
	req.logout();
	req.flash('success_msg', 'Logout successfully!');
	res.redirect('/');
});

// Routes of type POST

	// Route to create account
router.post(CREATE_ACCOUNT, async (req, res) => {
	const {
		name,
		email,
		password,
		confirm_password,
	} = req.body;

	let errors = [];

	if (!name) 
		errors.push({message: 'Name is mandatory!'});

	if (!email) 
		errors.push({message: 'E-mail is mandatory!'});

	if (!password) 
		errors.push({message: 'Password is mandatory!'});
	else if 
		(password.length < 4) errors.push({message: 'Password length too short, 4 characters required!'});
	else if 
		(password !== confirm_password) errors.push({message: 'Passwords are different, try again!'});

	if (errors.length > 0) 
		res.render('user/register', {
			route: CREATE_ACCOUNT,
			errors,
		});
	else {
		try {
			let user = await User.findOne({email});

			if (user) {
				req.flash('error_msg', 'This e-mail has already been registered in the sistem!');
				res.redirect(INDEX_ROUTE + CREATE_ACCOUNT);
			} else {
				const formData = Object.assign({}, req.body);
				delete formData.confirm_password;

				user = new User(formData);

				genSalt(10, (err, salt) => {
					hash(user.password, salt, async (err, hash) => {
						if (err) {
							req.flash('error_msg', 'An error occurred when creating account');
							res.redirect('/');
						}

						user.password = hash;

						try {
							await user.save();
							req.flash('success_msg', 'Account successfully created!');
							res.redirect('/');
						} catch (err) {
							req.flash('error_msg', 'An error occurred when creating account, try again!');
							res.redirect(INDEX_ROUTE + CREATE_ACCOUNT);
						}
					});
				});
			}
		} catch (err) {
			req.flash('error_msg', 'An internal error occurred!');
			res.redirect('/');
		}
	}
});

	// Route to authenticate user when logging in
router.post(LOGIN, (req, res, next) => {
	passport.authenticate('local', {
		successRedirect: '/',
		failureRedirect: INDEX_ROUTE + LOGIN,
		failureFlash: true,
	})(req, res, next);
});

module.exports = router;