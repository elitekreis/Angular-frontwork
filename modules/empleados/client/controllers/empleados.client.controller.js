(function () {
    'use strict';

    // Empleados controller
    angular
        .module('empleados')
        .controller('EmpleadosController', EmpleadosController);

    EmpleadosController.$inject = ['$scope', '$state', 'Authentication', 'empleado', 'user', 'puestos', 'ServiceNavigation'];

    function EmpleadosController($scope, $state, Authentication, empleado, user, puestos, ServiceNavigation) {
        var vm = this;
        var list;
        vm.authentication = Authentication;
        vm.empleado = empleado;
        vm.puestos = puestos;
        vm.error = null;
        vm.update = update;
        vm.roles = $scope.roles = ['user', 'admin', 'rrhh', 'compras', 'ventas', 'produccion', 'cliente'];
       
        //removes the last nav from the list always.
        /*vm.removeSubNav = function(){
        alert("They said close")           
            list = ServiceNavigation.getNav();
            list.splice(list.length - 1);
        }*/      

        function update() {
          if (confirm("are you sure to change? changing the puesto will change the puesto for other personell with same puesto")) {
            vm.empleado.puesto = vm.nuevoPuesto;
            vm.empleado.userLogin.roles[0] = vm.rol;
            vm.empleado.enterprise = vm.empleado.enterprise._id;
            vm.empleado.$update(successCallback, errorCallback);

            function successCallback(res) {
              $state.go('home.viewEmpleado', {
                empleadoId: res._id
              });
            }

            function errorCallback(res) {
              console.log('error');
              vm.error = res.data.message;
            }
          }
        }
    }
})();
