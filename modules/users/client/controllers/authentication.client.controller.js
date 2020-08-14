'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$http', '$location', 'Authentication', '$state',
	function($scope, $http, $location, Authentication, $state) {
		$scope.authentication = Authentication;

		// If user is signed in then redirect back home
		if (($scope.authentication.user) && ($scope.authentication.user.roles[0] !== 'cliente')) $location.path('/welcome');
		if (($scope.authentication.user) && ($scope.authentication.user.roles[0] === 'cliente')) $state.go('home.createPedido', { "tipo": "venta"});

		$scope.signup = function() {
			console.log($scope.credentials);
			$http.post('/api/auth/signup', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;
				console.log(response);
				// And redirect to the index page
				if (response.roles[0] !== 'cliente'){
					$location.path('/welcome');
				}
				else{
					$state.go('home.createPedido', { "tipo": "venta"});
				}
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		$scope.signin = function() {
			$http.post('/api/auth/signin', $scope.credentials).success(function(response) {

				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				// And redirect to the index page
				if (response.roles[0] !== 'cliente'){
					$location.path('/welcome');
				}
				else{
					$state.go('home.createPedido', { "tipo": "venta"});
				}
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
