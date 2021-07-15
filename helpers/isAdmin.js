module.exports = {
	isAdmin: (req, res, next) => {
		const { isAuthenticated, user } = req;

		if (isAuthenticated() && user.type === 'A') {
			return next();
		}

		req.flash('error_msg', 'You must be admin to access this page!');
		res.redirect('/');
	},
};