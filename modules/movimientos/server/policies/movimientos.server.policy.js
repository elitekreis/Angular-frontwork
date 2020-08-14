'use strict';

/**
 * Module dependencies.
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Comprobantes Permissions
 */
exports.invokeRolesPolicies = function() {
	acl.allow([{
		roles: ['groso'],
		allows: [{
			resources: '/api/movimientos',
			permissions: '*'
		}, {
			resources: '/api/movimientos/:movimientoId',
			permissions: '*'
		},{
			resources: '/api/movimientos/loadmore',
			permissions: '*'
		}]
	}, {
		roles: ['admin'],
		allows: [{
			resources: '/api/movimientos',
			permissions: '*'
		}, {
			resources: '/api/movimientos/:movimientoId',
			permissions: '*'
		},{
			resources: '/api/movimientos/loadmore',
			permissions: '*'
		}]
	}, {
		roles: ['user'],
		allows: [{
			resources: '/api/movimientos',
			permissions: ['get', 'post']
		}, {
			resources: '/api/movimientos/:movimientoId',
			permissions: ['get']
		}]
	}, {
		roles: ['guest'],
		allows: [{
			resources: '/api/movimientos',
			permissions: ['get']
		}, {
			resources: '/api/movimientos/:movimientoId',
			permissions: ['get']
		}]
	}]);
};

/**
 * Check If Articles Policy Allows
 */
exports.isAllowed = function(req, res, next) {
	var roles = (req.user) ? req.user.roles : ['guest'];

	// If an comprobante is being processed and the current user created it then allow any manipulation
	if (req.movimiento && req.user && req.movimiento.user.id === req.user.id) {
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
