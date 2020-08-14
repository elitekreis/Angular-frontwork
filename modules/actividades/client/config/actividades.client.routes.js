'use strict';

//Setting up route
angular.module('actividades').config(['$stateProvider',
	function($stateProvider) {
		// actividades state routing
		$stateProvider.
		state('actividades', {
			abstract: true,
			url: '/actividades',
			template: '<ui-view/>'
		})
	}
]);