const localStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

require('../models/User');
const User = mongoose.model('users');

function auth(passport) {
	passport.use(new localStrategy({
		usernameField: 'email',
		passwordField: 'password',
	}, async (email, password, done) => {
		try {
			const user = await User.findOne({email});
			
			if (!user) 
				return done(null, false, {message: 'User not found!'});
			
			bcrypt.compare(password, user.password, (err, isEqual) => {
				if (isEqual)
					return done(null, user);

				return done(null, false, {message: 'Incorrect password!'});
			});
		} catch (err) {
			
		}
	}));

	passport.serializeUser((user, done) => {
		done(null, user.id);
	});

	passport.deserializeUser((id, done) => {
		User.findById(id, (err, user) => {
			done(err, user);
		});
	});
};

module.exports = auth;