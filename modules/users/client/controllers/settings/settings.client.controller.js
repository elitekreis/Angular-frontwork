'use strict';

angular.module('users').controller('SettingsController', ['$scope', '$http', '$location', 'Users', 'Authentication', '$mdSidenav', '$q',
	function($scope, $http, $location, Users, Authentication, $mdSidenav, $q) {
		$scope.user = Authentication.user;
		$scope.toggleList   = toggleUsersList;

		// If user is not signed in then redirect back home
		if (!$scope.user) $location.path('/');

		function toggleUsersList() {
	      var pending = $q.when(true);

	      pending.then(function(){
	        $mdSidenav('left').toggle();
	      });
	    }

	}
]);
