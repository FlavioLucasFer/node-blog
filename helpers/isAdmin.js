function isAdmin(req, res, next) {
	const { user } = req;

	if (user.type === 'A') {
		return next();
	}

	req.flash('error_msg', 'You must be admin to access this page!');
	res.redirect('/');
}

module.exports = isAdmin;