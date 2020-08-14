'use strict';

/**
 * Module dependencies
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Servicios Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['groso'],
    allows: [{
      resources: '/api/servicios',
      permissions: '*'
    }, {
      resources: '/api/servicios/:servicioId',
      permissions: '*'
    }, {
      resources: '/api/servicios/getCentroByServicios',
      permissions: '*'
    }]
  },{
    roles: ['admin'],
    allows: [{
      resources: '/api/servicios',
      permissions: '*'
    }, {
      resources: '/api/servicios/:servicioId',
      permissions: '*'
    }, {
      resources: '/api/servicios/getCentroByServicios',
      permissions: '*'
    }]
  }, {
    roles: ['user'],
    allows: [{
      resources: '/api/servicios',
      permissions: ['get', 'post']
    }, {
      resources: '/api/servicios/:servicioId',
      permissions: ['get']
    }, {
      resources: '/api/servicios/getCentroByServicios',
      permissions: '*'
    }]
  }, {
    roles: ['guest'],
    allows: [{
      resources: '/api/servicios',
      permissions: ['get']
    }, {
      resources: '/api/servicios/:servicioId',
      permissions: ['get']
    }, {
      resources: '/api/servicios/getCentroByServicios',
      permissions: '*'
    }]
  }]);
};

/**
 * Check If Servicios Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  // If an Servicio is being processed and the current user created it then allow any manipulation
  if (req.servicio && req.user && req.servicio.user && req.servicio.user.id === req.user.id) {
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
