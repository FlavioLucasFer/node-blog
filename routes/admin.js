// Loading modules
const express = require('express');
const router = express.Router();

// Routes
router.get('/', (req, res) => {
	res.render('admin/index');
});

router.get('/posts', (req, res) => {
	res.send("Admin posts page");
});

module.exports = router;