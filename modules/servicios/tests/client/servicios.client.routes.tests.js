(function () {
  'use strict';

  describe('Servicios Route Tests', function () {
    // Initialize global variables
    var $scope,
      ServiciosService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _ServiciosService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      ServiciosService = _ServiciosService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('servicios');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/servicios');
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
          ServiciosController,
          mockServicio;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('servicios.view');
          $templateCache.put('modules/servicios/client/views/view-servicio.client.view.html', '');

          // create mock Servicio
          mockServicio = new ServiciosService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Servicio Name'
          });

          // Initialize Controller
          ServiciosController = $controller('ServiciosController as vm', {
            $scope: $scope,
            servicioResolve: mockServicio
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:servicioId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.servicioResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            servicioId: 1
          })).toEqual('/servicios/1');
        }));

        it('should attach an Servicio to the controller scope', function () {
          expect($scope.vm.servicio._id).toBe(mockServicio._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/servicios/client/views/view-servicio.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          ServiciosController,
          mockServicio;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('servicios.create');
          $templateCache.put('modules/servicios/client/views/form-servicio.client.view.html', '');

          // create mock Servicio
          mockServicio = new ServiciosService();

          // Initialize Controller
          ServiciosController = $controller('ServiciosController as vm', {
            $scope: $scope,
            servicioResolve: mockServicio
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.servicioResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/servicios/create');
        }));

        it('should attach an Servicio to the controller scope', function () {
          expect($scope.vm.servicio._id).toBe(mockServicio._id);
          expect($scope.vm.servicio._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/servicios/client/views/form-servicio.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          ServiciosController,
          mockServicio;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('servicios.edit');
          $templateCache.put('modules/servicios/client/views/form-servicio.client.view.html', '');

          // create mock Servicio
          mockServicio = new ServiciosService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Servicio Name'
          });

          // Initialize Controller
          ServiciosController = $controller('ServiciosController as vm', {
            $scope: $scope,
            servicioResolve: mockServicio
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:servicioId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.servicioResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            servicioId: 1
          })).toEqual('/servicios/1/edit');
        }));

        it('should attach an Servicio to the controller scope', function () {
          expect($scope.vm.servicio._id).toBe(mockServicio._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/servicios/client/views/form-servicio.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
}());
