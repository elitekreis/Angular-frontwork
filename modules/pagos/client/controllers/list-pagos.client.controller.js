(function () {
  'use strict';

  angular
    .module('pagos')
    .controller('PagosListController', PagosListController);

  PagosListController.$inject = ['PagosService'];

  function PagosListController(PagosService) {
    var vm = this;

    vm.pagos = PagosService.query();
  }
}());
