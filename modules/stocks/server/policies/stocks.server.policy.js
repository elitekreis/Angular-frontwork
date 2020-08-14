'use strict';

/**
 * Module dependencies.
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Stocks Permissions
 */
exports.invokeRolesPolicies = function() {
	acl.allow([{
		roles: ['groso'],
		allows: [{
			resources: '/api/stocks',
			permissions: '*'
		}, {
			resources: '/api/stocks/orders/:productID',
			permissions: '*'
		}, {
			resources: '/api/stocks/:stockId',
			permissions: '*'
		}]
	}, {
		roles: ['admin'],
		allows: [{
			resources: '/api/stocks',
			permissions: '*'
		}, {
			resources: '/api/stocks/orders/:productID',
			permissions: '*'
		}, {
			resources: '/api/stocks/:stockId',
			permissions: '*'
		}]
	}, {
		roles: ['compras'],
		allows: [{
			resources: '/api/stocks',
			permissions: '*'
		}, {
			resources: '/api/stocks/orders/:productID',
			permissions: '*'
		}, {
			resources: '/api/stocks/:stockId',
			permissions: '*'
		}]
	}, {
		roles: ['produccion'],
		allows: [{
			resources: '/api/stocks',
			permissions: '*'
		}, {
			resources: '/api/stocks/orders/:productID',
			permissions: '*'
		}, {
			resources: '/api/stocks/:stockId',
			permissions: '*'
		}]
	}, {
		roles: ['user'],
		allows: [{
			resources: '/api/stocks',
			permissions: '*'
		}, {
			resources: '/api/stocks/orders/:productID',
			permissions: '*'
		}, {
			resources: '/api/stocks/:stockId',
			permissions: '*'
		}]
	}, {
		roles: ['guest'],
		allows: [{
			resources: '/api/stocks',
			permissions: ['get']
		}, {
			resources: '/api/stocks/orders/:productID',
			permissions: 'get'
		}, {
			resources: '/api/stocks/:stockId',
			permissions: ['get']
		}]
	}]);
};

/**
 * Check If Articles Policy Allows
 */
exports.isAllowed = function(req, res, next) {
	var roles = (req.user) ? req.user.roles : ['guest'];

	// If an stock is being processed and the current user created it then allow any manipulation
	if (req.stock && req.user && req.stock.user.id === req.user.id) {
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
