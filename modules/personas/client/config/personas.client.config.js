'use strict';

// Configuring the Personas module
angular.module('personas').run(['Menus',
	function(Menus) {
		// Add the Personas dropdown item
		Menus.addMenuItem('topbar', {
			title: 'Personas',
			state: 'personas',
			type: 'dropdown'
		});

		// Add the dropdown list item
		Menus.addSubMenuItem('topbar', 'personas', {
			title: 'List Personas',
			state: 'personas.list'
		});

		// Add the dropdown create item
		Menus.addSubMenuItem('topbar', 'personas', {
			title: 'Create Persona',
			state: 'personas.create'
		});
	}
]);