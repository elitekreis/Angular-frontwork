'use strict';

// Configuring the Ventas module
angular.module('reportes').run(['Menus',
	function(Menus) {
		// Add the Ventas dropdown item
		Menus.addMenuItem('topbar', {
			title: 'Reportes',
			state: 'reportes',
			type: 'dropdown'
		});

		// Add the dropdown list item
		Menus.addSubMenuItem('topbar', 'reportes', {
			title: 'List Reportes',
			state: 'reportes.list'
		});

		// Add the dropdown create item
		Menus.addSubMenuItem('topbar', 'reportes', {
			title: 'Create Reporte',
			state: 'reportes.create'
		});
	}
]);
