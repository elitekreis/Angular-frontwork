'use strict';

module.exports = function(app) {
	var personas = require('../controllers/personas.server.controller');
	var personasPolicy = require('../policies/personas.server.policy');

	// Personas Routes
	app.route('/api/personas').all()
		.get(personas.list).all(personasPolicy.isAllowed)
		.post(personas.create);

	app.route('/api/personas/:personaId').all(personasPolicy.isAllowed)
		.get(personas.read)
		.put(personas.update)
		.delete(personas.delete);

	// Finish by binding the Persona middleware
	app.param('personaId', personas.personaByID);
};