'use strict';

// Configuring the actividades module
angular.module('actividades').run(['Menus',
	function(Menus) {
		// Add the actividades dropdown item
		Menus.addMenuItem('topbar', {
			title: 'Actividades',
			state: 'actividades',
			type: 'dropdown'
		});

		// Add the dropdown list item
		Menus.addSubMenuItem('topbar', 'actividades', {
			title: 'List actividades',
			state: 'actividades.list'
		});

		// Add the dropdown create item
		Menus.addSubMenuItem('topbar', 'actividades', {
			title: 'Create Liquidacion',
			state: 'actividades.create'
		});
	}
]);