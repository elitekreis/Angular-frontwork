'use strict';

// Configuring the remuneraciones module
angular.module('remuneraciones').run(['Menus',
	function(Menus) {
		// Add the remuneraciones dropdown item
		Menus.addMenuItem('topbar', {
			title: 'Remuneraciones',
			state: 'remuneraciones',
			type: 'dropdown'
		});

		// Add the dropdown list item
		Menus.addSubMenuItem('topbar', 'remuneraciones', {
			title: 'List Remuneraciones',
			state: 'remuneraciones.list'
		});

		// Add the dropdown create item
		Menus.addSubMenuItem('topbar', 'remuneraciones', {
			title: 'Create Remuneracione',
			state: 'remuneraciones.create'
		});
	}
]);