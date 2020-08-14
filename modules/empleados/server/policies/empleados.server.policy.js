'use strict';

/**
 * Module dependencies
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Empleados Permissions
 */
exports.invokeRolesPolicies = function () {
    acl.allow([{
        roles: ['groso'],
        allows: [{
            resources: '/api/empleados',
            permissions: '*'
        }, {
            resources: '/api/empleados/user',
            permissions: '*'
        }, {
            resources: '/api/empleados/:empleadoId',
            permissions: '*'
        }]
    }, {
        roles: ['admin'],
        allows: [{
            resources: '/api/empleados',
            permissions: '*'
        }, {
            resources: '/api/empleados/user',
            permissions: '*'
        }, {
            resources: '/api/empleados/:empleadoId',
            permissions: '*'
        }]
    }, {
        roles: ['user'],
        allows: [{
            resources: '/api/empleados',
            permissions: '*'
        }, {
            resources: '/api/empleados/user',
            permissions: '*'
        }, {
            resources: '/api/empleados/:empleadoId',
            permissions: '*'
        }]
    }, {
        roles: ['compras'],
        allows: [{
            resources: '/api/empleados',
            permissions: ['get', 'post']
        }, {
            resources: '/api/empleados/user',
            permissions: ['get', 'post']
        }, {
            resources: '/api/empleados/:empleadoId',
            permissions: ['get']
        }]
    }, {
        roles: ['guest'],
        allows: [{
            resources: '/api/empleados',
            permissions: ['get']
        }, {
            resources: '/api/empleados/user',
            permissions: ['get']
        }, {
            resources: '/api/empleados/:empleadoId',
            permissions: ['get']
        }]
    }]);
};

/**
 * Check If Empleados Policy Allows
 */
exports.isAllowed = function (req, res, next) {
    var roles = (req.user) ? req.user.roles : ['guest'];

    // If an Empleado is being processed and the current user created it then allow any manipulation
    if (req.empleado && req.user && req.empleado.user && req.empleado.user.id === req.user.id) {
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
