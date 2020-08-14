'use strict';

/**
 * Module dependencies.
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Taxconditions Permissions
 */
exports.invokeRolesPolicies = function() {
	acl.allow([{
		roles: ['groso'],
		allows: [{
			resources: '/api/taxconditions',
			permissions: '*'
		}, {
			resources: '/api/taxconditions/:taxconditionId',
			permissions: '*'
		}]
	}, {
		roles: ['admin'],
		allows: [{
			resources: '/api/taxconditions',
			permissions: '*'
		}, {
			resources: '/api/taxconditions/:taxconditionId',
			permissions: '*'
		}]
	}, {
		roles: ['user'],
		allows: [{
			resources: '/api/taxconditions',
			permissions: ['get', 'post']
		}, {
			resources: '/api/taxconditions/:taxconditionId',
			permissions: ['get']
		}]
	}, {
		roles: ['guest'],
		allows: [{
			resources: '/api/taxconditions',
			permissions: ['get']
		}, {
			resources: '/api/taxconditions/:taxconditionId',
			permissions: ['get']
		}]
	}]);
};

/**
 * Check If Articles Policy Allows
 */
exports.isAllowed = function(req, res, next) {
	var roles = (req.user) ? req.user.roles : ['guest'];

	// If an taxcondition is being processed and the current user created it then allow any manipulation
	if (req.taxcondition && req.user && req.taxcondition.user.id === req.user.id) {
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
