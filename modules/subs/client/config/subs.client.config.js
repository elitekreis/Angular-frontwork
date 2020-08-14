'use strict';

// Configuring the Subs module
angular.module('subs').run(['Menus',
	function(Menus) {
		// Add the Subs dropdown item
		Menus.addMenuItem('topbar', {
			title: 'Subs',
			state: 'subs',
			type: 'dropdown'
		});

		// Add the dropdown list item
		Menus.addSubMenuItem('topbar', 'subs', {
			title: 'List Subs',
			state: 'subs.list'
		});

		// Add the dropdown create item
		Menus.addSubMenuItem('topbar', 'subs', {
			title: 'Create Sub',
			state: 'subs.create'
		});
	}
]);