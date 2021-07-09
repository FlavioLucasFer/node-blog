// Loading modules
const express = require('express');
const handlebars = require('express-handlebars');
// const mongoose = require('mongoose');
const path = require('path');

const app = express();

// Configuration
	// Express
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
	// Handlebars
app.engine('handlebars', handlebars({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
	// Mongoose
		// Soon

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