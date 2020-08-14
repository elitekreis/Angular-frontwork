'use strict';

(function() {
	// Puestos Controller Spec
	describe('Puestos Controller Tests', function() {
		// Initialize global variables
		var PuestosController,
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

			// Initialize the Puestos controller.
			PuestosController = $controller('PuestosController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Puesto object fetched from XHR', inject(function(Puestos) {
			// Create sample Puesto using the Puestos service
			var samplePuesto = new Puestos({
				name: 'New Puesto'
			});

			// Create a sample Puestos array that includes the new Puesto
			var samplePuestos = [samplePuesto];

			// Set GET response
			$httpBackend.expectGET('api/puestos').respond(samplePuestos);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.puestos).toEqualData(samplePuestos);
		}));

		it('$scope.findOne() should create an array with one Puesto object fetched from XHR using a puestoId URL parameter', inject(function(Puestos) {
			// Define a sample Puesto object
			var samplePuesto = new Puestos({
				name: 'New Puesto'
			});

			// Set the URL parameter
			$stateParams.puestoId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/api\/puestos\/([0-9a-fA-F]{24})$/).respond(samplePuesto);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.puesto).toEqualData(samplePuesto);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Puestos) {
			// Create a sample Puesto object
			var samplePuestoPostData = new Puestos({
				name: 'New Puesto'
			});

			// Create a sample Puesto response
			var samplePuestoResponse = new Puestos({
				_id: '525cf20451979dea2c000001',
				name: 'New Puesto'
			});

			// Fixture mock form input values
			scope.name = 'New Puesto';

			// Set POST response
			$httpBackend.expectPOST('api/puestos', samplePuestoPostData).respond(samplePuestoResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Puesto was created
			expect($location.path()).toBe('/puestos/' + samplePuestoResponse._id);
		}));

		it('$scope.update() should update a valid Puesto', inject(function(Puestos) {
			// Define a sample Puesto put data
			var samplePuestoPutData = new Puestos({
				_id: '525cf20451979dea2c000001',
				name: 'New Puesto'
			});

			// Mock Puesto in scope
			scope.puesto = samplePuestoPutData;

			// Set PUT response
			$httpBackend.expectPUT(/api\/puestos\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/puestos/' + samplePuestoPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid puestoId and remove the Puesto from the scope', inject(function(Puestos) {
			// Create new Puesto object
			var samplePuesto = new Puestos({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Puestos array and include the Puesto
			scope.puestos = [samplePuesto];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/api\/puestos\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(samplePuesto);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.puestos.length).toBe(0);
		}));
	});
}());