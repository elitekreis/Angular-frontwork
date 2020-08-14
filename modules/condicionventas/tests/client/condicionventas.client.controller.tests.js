'use strict';

(function() {
	// Condicionventas Controller Spec
	describe('Condicionventas Controller Tests', function() {
		// Initialize global variables
		var CondicionventasController,
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

			// Initialize the Condicionventas controller.
			CondicionventasController = $controller('CondicionventasController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Condicionventa object fetched from XHR', inject(function(Condicionventas) {
			// Create sample Condicionventa using the Condicionventas service
			var sampleCondicionventa = new Condicionventas({
				name: 'New Condicionventa'
			});

			// Create a sample Condicionventas array that includes the new Condicionventa
			var sampleCondicionventas = [sampleCondicionventa];

			// Set GET response
			$httpBackend.expectGET('api/condicionventas').respond(sampleCondicionventas);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.condicionventas).toEqualData(sampleCondicionventas);
		}));

		it('$scope.findOne() should create an array with one Condicionventa object fetched from XHR using a condicionventaId URL parameter', inject(function(Condicionventas) {
			// Define a sample Condicionventa object
			var sampleCondicionventa = new Condicionventas({
				name: 'New Condicionventa'
			});

			// Set the URL parameter
			$stateParams.condicionventaId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/api\/condicionventas\/([0-9a-fA-F]{24})$/).respond(sampleCondicionventa);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.condicionventa).toEqualData(sampleCondicionventa);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Condicionventas) {
			// Create a sample Condicionventa object
			var sampleCondicionventaPostData = new Condicionventas({
				name: 'New Condicionventa'
			});

			// Create a sample Condicionventa response
			var sampleCondicionventaResponse = new Condicionventas({
				_id: '525cf20451979dea2c000001',
				name: 'New Condicionventa'
			});

			// Fixture mock form input values
			scope.name = 'New Condicionventa';

			// Set POST response
			$httpBackend.expectPOST('api/condicionventas', sampleCondicionventaPostData).respond(sampleCondicionventaResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Condicionventa was created
			expect($location.path()).toBe('/condicionventas/' + sampleCondicionventaResponse._id);
		}));

		it('$scope.update() should update a valid Condicionventa', inject(function(Condicionventas) {
			// Define a sample Condicionventa put data
			var sampleCondicionventaPutData = new Condicionventas({
				_id: '525cf20451979dea2c000001',
				name: 'New Condicionventa'
			});

			// Mock Condicionventa in scope
			scope.condicionventa = sampleCondicionventaPutData;

			// Set PUT response
			$httpBackend.expectPUT(/api\/condicionventas\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/condicionventas/' + sampleCondicionventaPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid condicionventaId and remove the Condicionventa from the scope', inject(function(Condicionventas) {
			// Create new Condicionventa object
			var sampleCondicionventa = new Condicionventas({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Condicionventas array and include the Condicionventa
			scope.condicionventas = [sampleCondicionventa];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/api\/condicionventas\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleCondicionventa);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.condicionventas.length).toBe(0);
		}));
	});
}());