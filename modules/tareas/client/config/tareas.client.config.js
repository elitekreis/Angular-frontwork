'use strict';

// Configuring the Categories module
angular.module('tareas').run(['Menus',
	function(Menus) {
		// Add the Categories dropdown item
		Menus.addMenuItem('topbar', {
			title: 'Tareas',
			state: 'tareas',
			type: 'dropdown'
		});

		// Add the dropdown list item
		Menus.addSubMenuItem('topbar', 'tareas', {
			title: 'List Tareas',
			state: 'tareas.list'
		});

		// Add the dropdown create item
		Menus.addSubMenuItem('topbar', 'tareas', {
			title: 'Create Tarea',
			state: 'tareas.create'
		});
	}
]);