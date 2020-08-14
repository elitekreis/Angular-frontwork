'use strict';

/**
 * Module dependencies.
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Actividades Permissions
 */
exports.invokeRolesPolicies = function() {
	acl.allow([{
		roles: ['groso'],
		allows: [{
			resources: '/api/actividades',
			permissions: '*'
		}, {
			resources: '/api/actividades/:actividadId',
			permissions: '*'
		}]
	}, {
		roles: ['admin'],
		allows: [{
			resources: '/api/actividades',
			permissions: '*'
		}, {
			resources: '/api/actividades/:actividadId',
			permissions: '*'
		}]
	}, {
		roles: ['cliente'],
		allows: [{
			resources: '/api/actividades',
			permissions: ['get', 'put']
		}, {
			resources: '/api/actividades/:actividadId',
			permissions: ['get']
		}]
	}, {	
		roles: ['produccion'],
		allows: [{
			resources: '/api/actividades',
			permissions: ['get', 'put']
		}, {
			resources: '/api/actividades/:actividadId',
			permissions: ['get']
		}]
	}, {
		roles: ['user'],
		allows: [{
			resources: '/api/actividades',
			permissions: '*'
		}, {
			resources: '/api/actividades/:actividadId',
			permissions: '*'
		}]
	}, {
		roles: ['compras'],
		allows: [{
			resources: '/api/actividades',
			permissions: '*'
		}, {
			resources: '/api/actividades/:actividadId',
			permissions: '*'
		}]
	}, {
		roles: ['ventas'],
		allows: [{
			resources: '/api/actividades',
			permissions: '*'
		}, {
			resources: '/api/actividades/:actividadId',
			permissions: '*'
		}]
	}, {
		roles: ['guest'],
		allows: [{
			resources: '/api/actividades',
			permissions: ['get', 'put']
		}, {
			resources: '/api/actividades/:actividadId',
			permissions: ['get']
		}]
	}]);
};

/**
 * Check If Articles Policy Allows
 */
exports.isAllowed = function(req, res, next) {
	var roles = (req.user) ? req.user.roles : ['guest'];

	// If an actividad is being processed and the current user created it then allow any manipulation
	if (req.actividad && req.user && req.actividad.user.id === req.user.id) {
		return next();
	}

	// Check for user roles
	acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function(err, isAllowed) {
		if (err) {
			// An authorization error occurred.
			return res.status(500).send('Unexpected authorization error');
		} else {
			if (isAllowed) {
				// Access granted! Invoke next middleware
				return next();
			} else {
				return res.status(403).json({
					message: 'User is not authorized'
				});
			}
		}
	});
};
