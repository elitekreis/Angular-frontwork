'use strict';

// Configuring the Areas module
angular.module('areas').run(['Menus',
	function(Menus) {
		// Add the Areas dropdown item
		Menus.addMenuItem('topbar', {
			title: 'Areas',
			state: 'areas',
			type: 'dropdown'
		});

		// Add the dropdown list item
		Menus.addSubMenuItem('topbar', 'areas', {
			title: 'List Areas',
			state: 'areas.list'
		});

		// Add the dropdown create item
		Menus.addSubMenuItem('topbar', 'areas', {
			title: 'Create Area',
			state: 'areas.create'
		});
	}
]);