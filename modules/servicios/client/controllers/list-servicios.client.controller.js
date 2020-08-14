(function () {
  'use strict';

  angular
    .module('servicios')
    .controller('ServiciosListController', ServiciosListController);

  ServiciosListController.$inject = ['ServiciosService'];

  function ServiciosListController(ServiciosService) {
    var vm = this;

    vm.servicios = ServiciosService.query();
  }
}());
