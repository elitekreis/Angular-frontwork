'use strict';

/**
 * Module dependencies
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Pagos Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['groso'],
    allows: [{
      resources: '/api/pagos',
      permissions: '*'
    }, {
      resources: '/api/pagos/:pagoId',
      permissions: '*'
    }]
  },{
    roles: ['admin'],
    allows: [{
      resources: '/api/pagos',
      permissions: '*'
    }, {
      resources: '/api/pagos/:pagoId',
      permissions: '*'
    }]
  }, {
    roles: ['user'],
    allows: [{
      resources: '/api/pagos',
      permissions: ['get', 'post']
    }, {
      resources: '/api/pagos/:pagoId',
      permissions: ['get']
    }]
  }, {
    roles: ['guest'],
    allows: [{
      resources: '/api/pagos',
      permissions: ['get']
    }, {
      resources: '/api/pagos/:pagoId',
      permissions: ['get']
    }]
  }]);
};

/**
 * Check If Pagos Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  // If an Pago is being processed and the current user created it then allow any manipulation
  if (req.pago && req.user && req.pago.user && req.pago.user.id === req.user.id) {
    return next();
  }

  // Check for user roles
  acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function (err, isAllowed) {
    if (err) {
      // An authorization error occurred
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
