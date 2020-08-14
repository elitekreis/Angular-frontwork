'use strict';

// Configuring the Categories module
angular.module('categories').run(['Menus',
	function(Menus) {
		// Add the Categories dropdown item
		Menus.addMenuItem('topbar', {
			title: 'Categories',
			state: 'categories',
			type: 'dropdown'
		});

		// Add the dropdown list item
		Menus.addSubMenuItem('topbar', 'categories', {
			title: 'List Categories',
			state: 'categories.list'
		});

		// Add the dropdown create item
		Menus.addSubMenuItem('topbar', 'categories', {
			title: 'Create Category',
			state: 'categories.create'
		});
	}
]);