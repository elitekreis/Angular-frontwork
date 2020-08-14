'use strict';

/**
 * Module dependencies.
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Pedidos Permissions
 */
exports.invokeRolesPolicies = function() {
	acl.allow([{
		roles: ['groso'],
		allows: [{
			resources: '/api/pedidos',
			permissions: '*'
		}, {
			resources: '/api/pedidos/:pedidoId',
			permissions: '*'
		}, {
            resources: '/api/pedidos/select',
            permissions: ['get']
        }, {
            resources: '/api/pedidos/loadmore',
            permissions: ['get']
        }]
	}, {
		roles: ['admin'],
		allows: [{
			resources: '/api/pedidos',
			permissions: '*'
		}, {
			resources: '/api/pedidos/:pedidoId',
			permissions: '*'
		}, {
            resources: '/api/pedidos/select',
            permissions: ['get']
        }, {
            resources: '/api/pedidos/loadmore',
            permissions: ['get']
        }]
	}, {
		roles: ['cliente'],
		allows: [{
			resources: '/api/pedidos',
			permissions: '*'
		}, {
			resources: '/api/pedidos/:pedidoId',
			permissions: '*'
		}, {
            resources: '/api/pedidos/select',
            permissions: ['get']
        }, {
            resources: '/api/pedidos/loadmore',
            permissions: ['get']
        }]
	}, {
		roles: ['compras'],
		allows: [{
			resources: '/api/pedidos',
			permissions: '*'
		}, {
			resources: '/api/pedidos/:pedidoId',
			permissions: '*'
		}, {
            resources: '/api/pedidos/select',
            permissions: ['get']
        }, {
            resources: '/api/pedidos/loadmore',
            permissions: ['get']
        }]
	},{
		roles: ['ventas'],
		allows: [{
			resources: '/api/pedidos',
			permissions: '*'
		}, {
			resources: '/api/pedidos/:pedidoId',
			permissions: '*'
		}, {
            resources: '/api/pedidos/select',
            permissions: ['get']
        }, {
            resources: '/api/pedidos/loadmore',
            permissions: ['get']
        }]
	}, {
		roles: ['user'],
		allows: [{
			resources: '/api/pedidos',
			permissions: '*'
		}, {
			resources: '/api/pedidos/:pedidoId',
			permissions: '*'
		}, {
            resources: '/api/pedidos/select',
            permissions: ['get']
        }, {
            resources: '/api/pedidos/loadmore',
            permissions: ['get']
        }]
	}, {
		roles: ['produccion'],
		allows: [{
			resources: '/api/pedidos',
			permissions: '*'
		}, {
			resources: '/api/pedidos/:pedidoId',
			permissions: '*'
		}, {
            resources: '/api/pedidos/select',
            permissions: ['get']
        }, {
            resources: '/api/pedidos/loadmore',
            permissions: ['get']
        }]
	}, {
		roles: ['guest'],
		allows: [{
			resources: '/api/pedidos',
			permissions: ['get']
		}, {
			resources: '/api/pedidos/:pedidoId',
			permissions: ['get']
		}, {
            resources: '/api/pedidos/select',
            permissions: ['get']
        }, {
            resources: '/api/pedidos/loadmore',
            permissions: ['get']
        }]
	}]);
};

/**
 * Check If Articles Policy Allows
 */
exports.isAllowed = function(req, res, next) {
	var roles = (req.user) ? req.user.roles : ['guest'];

	// If an pedido is being processed and the current user created it then allow any manipulation
	if (req.pedido && req.user && req.pedido.user.id === req.user.id) {
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
