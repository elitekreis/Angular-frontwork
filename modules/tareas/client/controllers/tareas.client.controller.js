'use strict';

angular.module('tareas').controller('TareasController', ['$scope', '$stateParams', '$location', 'Authentication', 'Tareas',
	function($scope, $stateParams, $location, Authentication, Tareas) {
		$scope.authentication = Authentication;

		$scope.create = function() {
			var tarea = new Tareas({
				title: this.title,
				content: this.content
			});
			tarea.$save(function(response) {
				$location.path('tareas/' + response._id);

				$scope.title = '';
				$scope.content = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.remove = function(tarea) {
			if (tarea) {
				tarea.$remove();

				for (var i in $scope.tareas) {
					if ($scope.tareas[i] === tarea) {
						$scope.tareas.splice(i, 1);
					}
				}
			} else {
				$scope.tarea.$remove(function() {
					$location.path('tareas');
				});
			}
		};

		$scope.update = function() {
			var tarea = $scope.tarea;

			tarea.$update(function() {
				$location.path('tareas/' + tarea._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.find = function() {
			$scope.tareas = Tareas.query();
		};

		$scope.findOne = function() {
			$scope.tarea = Tareas.get({
				tareaId: $stateParams.tareaId
			});
		};
	}
]);