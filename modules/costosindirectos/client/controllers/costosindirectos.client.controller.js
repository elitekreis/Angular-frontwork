(function () {
  'use strict';

  // Costosindirectos controller
  angular
    .module('costosindirectos')
    .controller('CostosindirectosController', CostosindirectosController);

  CostosindirectosController.$inject = ['$scope', '$state', '$window', 'Authentication', 'costosindirectoResolve'];

  function CostosindirectosController ($scope, $state, $window, Authentication, costosindirecto) {
    var vm = this;
    vm.authentication = Authentication;
    vm.costosindirecto = costosindirecto;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Costosindirecto
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.costosindirecto.$remove($state.go('costosindirectos.list'));
      }
    }

    // Save Costosindirecto
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.costosindirectoForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.costosindirecto._id) {
        vm.costosindirecto.$update(successCallback, errorCallback);
      } else {
        vm.costosindirecto.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('costosindirectos.view', {
          costosindirectoId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
