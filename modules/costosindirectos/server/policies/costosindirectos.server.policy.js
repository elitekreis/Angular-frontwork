'use strict';

/**
 * Module dependencies
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Costosindirectos Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['groso'],
    allows: [{
      resources: '/api/costosindirectos',
      permissions: '*'
    }, {
      resources: '/api/costosindirectos/:costosindirectoId',
      permissions: '*'
    }]
  },{
    roles: ['admin'],
    allows: [{
      resources: '/api/costosindirectos',
      permissions: '*'
    }, {
      resources: '/api/costosindirectos/:costosindirectoId',
      permissions: '*'
    }]
  }, {
    roles: ['user'],
    allows: [{
      resources: '/api/costosindirectos',
      permissions: ['get', 'post']
    }, {
      resources: '/api/costosindirectos/:costosindirectoId',
      permissions: ['get']
    }]
  }, {
    roles: ['guest'],
    allows: [{
      resources: '/api/costosindirectos',
      permissions: ['get']
    }, {
      resources: '/api/costosindirectos/:costosindirectoId',
      permissions: ['get']
    }]
  }]);
};

/**
 * Check If Costosindirectos Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  // If an Costosindirecto is being processed and the current user created it then allow any manipulation
  if (req.costosindirecto && req.user && req.costosindirecto.user && req.costosindirecto.user.id === req.user.id) {
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
