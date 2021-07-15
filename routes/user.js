const { Router } = require('express');
const { model } = require('mongoose');
const bcrypt = require('bcryptjs');
const passport = require('passport');
require('../models/User');

const router = Router();
const User = model('users');

router.get('/create-account', (req, res) => {
	res.render('user/register');
});

router.post('/create-account', async (req, res) => {
	const { 
		name, 
		email, 
		password,
		confirm_password,  
	} = req.body;

	let errors = [];

	if (!name) errors.push({message: 'Name is mandatory!'});
	
	if (!email) errors.push({message: 'E-mail is mandatory!'});
	
	if (!password) errors.push({message: 'Password is mandatory!'});
	else if (password.length < 4) errors.push({message: 'Password length too short, 4 characters required!'});
	else if (password !== confirm_password) errors.push({message: 'Passwords are different, try again!'});
	
	if (errors.length > 0) res.render('user/register', {errors});
	else {
		try {
			let user = await User.findOne({email});
	
			if (user) {
				req.flash('error_msg', 'This e-mail has already been registered in the sistem!');
				res.redirect('/user/create-account');
			} else {
				const formData = Object.assign({}, req.body);
				delete formData.confirm_password;
				
				user = new User(formData);

				bcrypt.genSalt(10, (err, salt) => {
					bcrypt.hash(user.password, salt, async (err, hash) => {
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
							res.redirect('/user/create-account');
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

router.get('/sign-in', (req, res) => {
	res.render('user/login');
});

router.post('/sign-in', (req, res, next) => {
	passport.authenticate('local', {
		successRedirect: '/',
		failureRedirect: '/user/sign-in',
		failureFlash: true,
	})(req, res, next);
});

router.get('/logout', (req, res) => {
	req.logout();
	req.flash('success_msg', 'Logout successfully!');
	res.redirect('/');
});

module.exports = router;