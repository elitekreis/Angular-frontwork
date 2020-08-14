(function () {
  'use strict';

  describe('Empleados Route Tests', function () {
    // Initialize global variables
    var $scope,
      EmpleadosService;

    //We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _EmpleadosService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      EmpleadosService = _EmpleadosService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('empleados');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/empleados');
        });

        it('Should be abstract', function () {
          expect(mainstate.abstract).toBe(true);
        });

        it('Should have template', function () {
          expect(mainstate.template).toBe('<ui-view/>');
        });
      });

      describe('View Route', function () {
        var viewstate,
          EmpleadosController,
          mockEmpleado;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('empleados.view');
          $templateCache.put('modules/empleados/client/views/view-empleado.client.view.html', '');

          // create mock Empleado
          mockEmpleado = new EmpleadosService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Empleado Name'
          });

          //Initialize Controller
          EmpleadosController = $controller('EmpleadosController as vm', {
            $scope: $scope,
            empleadoResolve: mockEmpleado
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:empleadoId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.empleadoResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            empleadoId: 1
          })).toEqual('/empleados/1');
        }));

        it('should attach an Empleado to the controller scope', function () {
          expect($scope.vm.empleado._id).toBe(mockEmpleado._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/empleados/client/views/view-empleado.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          EmpleadosController,
          mockEmpleado;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('empleados.create');
          $templateCache.put('modules/empleados/client/views/form-empleado.client.view.html', '');

          // create mock Empleado
          mockEmpleado = new EmpleadosService();

          //Initialize Controller
          EmpleadosController = $controller('EmpleadosController as vm', {
            $scope: $scope,
            empleadoResolve: mockEmpleado
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.empleadoResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/empleados/create');
        }));

        it('should attach an Empleado to the controller scope', function () {
          expect($scope.vm.empleado._id).toBe(mockEmpleado._id);
          expect($scope.vm.empleado._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/empleados/client/views/form-empleado.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          EmpleadosController,
          mockEmpleado;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('empleados.edit');
          $templateCache.put('modules/empleados/client/views/form-empleado.client.view.html', '');

          // create mock Empleado
          mockEmpleado = new EmpleadosService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Empleado Name'
          });

          //Initialize Controller
          EmpleadosController = $controller('EmpleadosController as vm', {
            $scope: $scope,
            empleadoResolve: mockEmpleado
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:empleadoId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.empleadoResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            empleadoId: 1
          })).toEqual('/empleados/1/edit');
        }));

        it('should attach an Empleado to the controller scope', function () {
          expect($scope.vm.empleado._id).toBe(mockEmpleado._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/empleados/client/views/form-empleado.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
})();
