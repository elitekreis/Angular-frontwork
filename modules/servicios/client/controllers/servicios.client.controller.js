(function () {
  'use strict';

  // Servicios controller
  angular
    .module('servicios')
    .controller('ServiciosController', ServiciosController);

  ServiciosController.$inject = ['$scope', '$state', '$window', 'Authentication', 'servicioResolve'];

  function ServiciosController ($scope, $state, $window, Authentication, servicio) {
    var vm = this;

    vm.authentication = Authentication;
    vm.servicio = servicio;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Servicio
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.servicio.$remove($state.go('servicios.list'));
      }
    }

    // Save Servicio
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.servicioForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.servicio._id) {
        vm.servicio.$update(successCallback, errorCallback);
      } else {
        vm.servicio.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('servicios.view', {
          servicioId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
