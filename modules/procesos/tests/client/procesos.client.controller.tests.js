'use strict';

(function() {
	// Procesos Controller Spec
	describe('Procesos Controller Tests', function() {
		// Initialize global variables
		var ProcesosController,
		scope,
		$httpBackend,
		$stateParams,
		$location;

		// The $resource service augments the response object with methods for updating and deleting the resource.
		// If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
		// the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
		// When the toEqualData matcher compares two objects, it takes only object properties into
		// account and ignores methods.
		beforeEach(function() {
			jasmine.addMatchers({
				toEqualData: function(util, customEqualityTesters) {
					return {
						compare: function(actual, expected) {
							return {
								pass: angular.equals(actual, expected)
							};
						}
					};
				}
			});
		});

		// Then we can start by loading the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		// The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
		// This allows us to inject a service but then attach it to a variable
		// with the same name as the service.
		beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
			// Set a new global scope
			scope = $rootScope.$new();

			// Point global variables to injected services
			$stateParams = _$stateParams_;
			$httpBackend = _$httpBackend_;
			$location = _$location_;

			// Initialize the Procesos controller.
			ProcesosController = $controller('ProcesosController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Proceso object fetched from XHR', inject(function(Procesos) {
			// Create sample Proceso using the Procesos service
			var sampleProceso = new Procesos({
				name: 'New Proceso'
			});

			// Create a sample Procesos array that includes the new Proceso
			var sampleProcesos = [sampleProceso];

			// Set GET response
			$httpBackend.expectGET('api/procesos').respond(sampleProcesos);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.procesos).toEqualData(sampleProcesos);
		}));

		it('$scope.findOne() should create an array with one Proceso object fetched from XHR using a procesoId URL parameter', inject(function(Procesos) {
			// Define a sample Proceso object
			var sampleProceso = new Procesos({
				name: 'New Proceso'
			});

			// Set the URL parameter
			$stateParams.procesoId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/api\/procesos\/([0-9a-fA-F]{24})$/).respond(sampleProceso);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.proceso).toEqualData(sampleProceso);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Procesos) {
			// Create a sample Proceso object
			var sampleProcesoPostData = new Procesos({
				name: 'New Proceso'
			});

			// Create a sample Proceso response
			var sampleProcesoResponse = new Procesos({
				_id: '525cf20451979dea2c000001',
				name: 'New Proceso'
			});

			// Fixture mock form input values
			scope.name = 'New Proceso';

			// Set POST response
			$httpBackend.expectPOST('api/procesos', sampleProcesoPostData).respond(sampleProcesoResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Proceso was created
			expect($location.path()).toBe('/procesos/' + sampleProcesoResponse._id);
		}));

		it('$scope.update() should update a valid Proceso', inject(function(Procesos) {
			// Define a sample Proceso put data
			var sampleProcesoPutData = new Procesos({
				_id: '525cf20451979dea2c000001',
				name: 'New Proceso'
			});

			// Mock Proceso in scope
			scope.proceso = sampleProcesoPutData;

			// Set PUT response
			$httpBackend.expectPUT(/api\/procesos\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/procesos/' + sampleProcesoPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid procesoId and remove the Proceso from the scope', inject(function(Procesos) {
			// Create new Proceso object
			var sampleProceso = new Procesos({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Procesos array and include the Proceso
			scope.procesos = [sampleProceso];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/api\/procesos\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleProceso);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.procesos.length).toBe(0);
		}));
	});
}());