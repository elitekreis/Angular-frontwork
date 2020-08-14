'use strict';

/**
 * Module dependencies.
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Ventas Permissions
 */
exports.invokeRolesPolicies = function() {
	acl.allow([{
		roles: ['groso'],
		allows: [{
			resources: '/api/ventas',
			permissions: '*'
		}, {
			resources: '/api/ventas/:ventaId',
			permissions: '*'
		}, {
			resources: '/api/ventas/select',
			permissions: '*'
		}, {
			resources: '/api/ventas/loadmore',
			permissions: '*'
		}, {
			resources: '/api/ventas/loadmoreByCaja',
			permissions: '*'
		}, {
            resources: '/api/ventas/loadmoreImpuestos',
            permissions: '*'
        }, {
            resources: '/api/ventas/mostrador',
            permissions: '*'
        }, {
            resources: '/api/ventas/print',
            permissions: '*'
        }]
	}, {
		roles: ['admin'],
		allows: [{
			resources: '/api/ventas',
			permissions: '*'
		}, {
			resources: '/api/ventas/:ventaId',
			permissions: '*'
		}, {
			resources: '/api/ventas/select',
			permissions: '*'
		}, {
			resources: '/api/ventas/loadmore',
			permissions: '*'
		},  {
			resources: '/api/ventas/loadmoreByCaja',
			permissions: '*'
		}, {
            resources: '/api/ventas/loadmoreImpuestos',
            permissions: '*'
        }, {
            resources: '/api/ventas/mostrador',
            permissions: '*'
        }, {
            resources: '/api/ventas/print',
            permissions: '*'
        }]
	}, {
		roles: ['user'],
		allows: [{
			resources: '/api/ventas',
			permissions: ['get', 'post']
		}, {
			resources: '/api/ventas/:ventaId',
			permissions: ['get']
		}, {
			resources: '/api/ventas/select',
			permissions: ['get']
		}, {
			resources: '/api/ventas/loadmore',
			permissions: ['get']
		},  {
			resources: '/api/ventas/loadmoreByCaja',
			permissions: '*'
		}, {
            resources: '/api/ventas/loadmoreImpuestos',
            permissions: ['get']
        }, {
            resources: '/api/ventas/mostrador',
            permissions: ['get']
        }, {
            resources: '/api/ventas/print',
            permissions: '*'
        }]
	}, {
		roles: ['guest'],
		allows: [{
			resources: '/api/ventas',
			permissions: ['get']
		}, {
			resources: '/api/ventas/:ventaId',
			permissions: ['get']
		}, {
			resources: '/api/ventas/select',
			permissions: ['get']
		}, {
			resources: '/api/ventas/loadmore',
			permissions: ['get']
		}, {
            resources: '/api/ventas/loadmoreImpuestos',
            permissions: ['get']
        }, {
            resources: '/api/ventas/mostrador',
            permissions: ['get']
        }]
	}]);
};

/**
 * Check If Articles Policy Allows
 */
exports.isAllowed = function(req, res, next) {
	var roles = (req.user) ? req.user.roles : ['guest'];

	// If an venta is being processed and the current user created it then allow any manipulation
	if (req.venta && req.user && req.venta.user.id === req.user.id) {
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
