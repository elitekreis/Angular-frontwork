'use strict';

/**
 * Module dependencies.
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Puestos Permissions
 */
exports.invokeRolesPolicies = function() {
	acl.allow([{
		roles: ['groso'],
		allows: [{
			resources: '/api/puestos',
			permissions: '*'
		}, {
			resources: '/api/puestos/:puestoId',
			permissions: '*'
		}]
	}, {
		roles: ['admin'],
		allows: [{
			resources: '/api/puestos',
			permissions: '*'
		}, {
			resources: '/api/puestos/:puestoId',
			permissions: '*'
		}]
	}, {
		roles: ['rrhh'],
		allows: [{
			resources: '/api/puestos',
			permissions: '*'
		}, {
			resources: '/api/puestos/:puestoId',
			permissions: '*'
		}]
	}, {
	roles: ['compras'],
		allows: [{
			resources: '/api/puestos',
			permissions: '*'
		}, {
			resources: '/api/puestos/:puestoId',
			permissions: '*'
		}]
	}, {	
		roles: ['user'],
		allows: [{
			resources: '/api/puestos',
			permissions: ['get', 'post']
		}, {
			resources: '/api/puestos/:puestoId',
			permissions: ['get']
		}]
	}, {
		roles: ['guest'],
		allows: [{
			resources: '/api/puestos',
			permissions: ['get']
		}, {
			resources: '/api/puestos/:puestoId',
			permissions: ['get']
		}]
	}]);
};

/**
 * Check If Articles Policy Allows
 */
exports.isAllowed = function(req, res, next) {
	var roles = (req.user) ? req.user.roles : ['guest'];

	// If an puesto is being processed and the current user created it then allow any manipulation
	if (req.puesto && req.user && req.puesto.user.id === req.user.id) {
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
