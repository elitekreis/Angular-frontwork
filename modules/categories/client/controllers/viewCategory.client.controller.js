'use strict';

// Comprobantes controller
angular.module('categories').controller('CategoriesViewController', ['user', 'category',
	function(user, category) {

		// asignacion de modelos
		this.user = user;
		this.category = category;

		this.selectedMode = 'md-scale';
	    this.selectedDirection = 'up';

		// asignacion de funciones

		// definicion de funciones


	}
]);