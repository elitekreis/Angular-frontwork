'use strict';

const throng = require('throng');
const WORKERS = process.env.WEB_CONCURRENCY || 2;


throng({
  workers: WORKERS,
  lifetime: Infinity
}, start);


function start() {

	/**
	 * Module dependencies.
	 */
	var config = require('./config/config'),
		mongoose = require('./config/lib/mongoose'),
		express = require('./config/lib/express');

		
	// Initialize mongoose
	mongoose.connect(function (db) {
		// Initialize express
		var app = express.init(db);

		// Start the app by listening on <port>
		app.listen(config.port);

		// Logging initialization
		console.log('MEAN.JS application started on port ' + config.port);
	});

}