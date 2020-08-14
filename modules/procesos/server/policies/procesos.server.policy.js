'use strict';

/**
 * Module dependencies.
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Procesos Permissions
 */
exports.invokeRolesPolicies = function() {
	acl.allow([{
		roles: ['groso'],
		allows: [{
			resources: '/api/procesos',
			permissions: '*'
		}, {
			resources: '/api/procesos/:procesoId',
			permissions: '*'
		}]
	}, {
		roles: ['admin'],
		allows: [{
			resources: '/api/procesos',
			permissions: '*'
		}, {
			resources: '/api/procesos/:procesoId',
			permissions: '*'
		}]
	}, {
		roles: ['rrhh'],
		allows: [{
			resources: '/api/procesos',
			permissions: '*'
		}, {
			resources: '/api/procesos/:procesoId',
			permissions: '*'
		}]	
	}, {
		roles: ['user'],
		allows: [{
			resources: '/api/procesos',
			permissions: ['get', 'post']
		}, {
			resources: '/api/procesos/:procesoId',
			permissions: ['get']
		}]
	}, {
		roles: ['guest'],
		allows: [{
			resources: '/api/procesos',
			permissions: ['get']
		}, {
			resources: '/api/procesos/:procesoId',
			permissions: ['get']
		}]
	}]);
};

/**
 * Check If Articles Policy Allows
 */
exports.isAllowed = function(req, res, next) {
	var roles = (req.user) ? req.user.roles : ['guest'];

	// If an proceso is being processed and the current user created it then allow any manipulation
	if (req.proceso && req.user && req.proceso.user.id === req.user.id) {
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
