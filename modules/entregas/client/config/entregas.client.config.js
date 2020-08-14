'use strict';

// Configuring the Entregas module
angular.module('entregas').run(['Menus',
	function(Menus) {
		// Add the Entregas dropdown item
		Menus.addMenuItem('topbar', {
			title: 'Entregas',
			state: 'entregas',
			type: 'dropdown'
		});

		// Add the dropdown list item
		Menus.addSubMenuItem('topbar', 'entregas', {
			title: 'List Entregas',
			state: 'entregas.list'
		});

		// Add the dropdown create item
		Menus.addSubMenuItem('topbar', 'entregas', {
			title: 'Create Entrega',
			state: 'entregas.create'
		});
	}
]);