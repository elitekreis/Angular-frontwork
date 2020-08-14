(function () {
  'use strict';

  // Pagos controller
  angular
    .module('pagos')
    .controller('PagosController', PagosController);

  PagosController.$inject = ['$scope', '$state', '$window', 'Authentication', 'pagoResolve'];

  function PagosController ($scope, $state, $window, Authentication, pago) {
    var vm = this;

    vm.authentication = Authentication;
    vm.pago = pago;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Pago
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.pago.$remove($state.go('pagos.list'));
      }
    }

    // Save Pago
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.pagoForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.pago._id) {
        vm.pago.$update(successCallback, errorCallback);
      } else {
        vm.pago.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('pagos.view', {
          pagoId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
