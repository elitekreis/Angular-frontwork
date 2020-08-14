'use strict';

// Configuring the Rrhhs module
angular.module('impuestos').run(['Menus',
    function(Menus) {
        // Add the Rrhhs dropdown item
        Menus.addMenuItem('topbar', {
            title: 'Impuestos',
            state: 'impuestos',
            type: 'dropdown'
        });

        // Add the dropdown list item
        Menus.addSubMenuItem('topbar', 'impuestos', {
            title: 'List Impuestos',
            state: 'impuestos.list'
        });

        // Add the dropdown create item
        Menus.addSubMenuItem('topbar', 'impuestos', {
            title: 'Create Impuesto',
            state: 'impuestos.create'
        });
    }
]);