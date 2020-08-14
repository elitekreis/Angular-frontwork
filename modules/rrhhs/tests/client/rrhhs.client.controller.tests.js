'use strict';

(function() {
	// Rrhhs Controller Spec
	describe('Rrhhs Controller Tests', function() {
		// Initialize global variables
		var RrhhsController,
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

			// Initialize the Rrhhs controller.
			RrhhsController = $controller('RrhhsController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Rrhh object fetched from XHR', inject(function(Rrhhs) {
			// Create sample Rrhh using the Rrhhs service
			var sampleRrhh = new Rrhhs({
				name: 'New Rrhh'
			});

			// Create a sample Rrhhs array that includes the new Rrhh
			var sampleRrhhs = [sampleRrhh];

			// Set GET response
			$httpBackend.expectGET('api/rrhhs').respond(sampleRrhhs);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.rrhhs).toEqualData(sampleRrhhs);
		}));

		it('$scope.findOne() should create an array with one Rrhh object fetched from XHR using a rrhhId URL parameter', inject(function(Rrhhs) {
			// Define a sample Rrhh object
			var sampleRrhh = new Rrhhs({
				name: 'New Rrhh'
			});

			// Set the URL parameter
			$stateParams.rrhhId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/api\/rrhhs\/([0-9a-fA-F]{24})$/).respond(sampleRrhh);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.rrhh).toEqualData(sampleRrhh);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Rrhhs) {
			// Create a sample Rrhh object
			var sampleRrhhPostData = new Rrhhs({
				name: 'New Rrhh'
			});

			// Create a sample Rrhh response
			var sampleRrhhResponse = new Rrhhs({
				_id: '525cf20451979dea2c000001',
				name: 'New Rrhh'
			});

			// Fixture mock form input values
			scope.name = 'New Rrhh';

			// Set POST response
			$httpBackend.expectPOST('api/rrhhs', sampleRrhhPostData).respond(sampleRrhhResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Rrhh was created
			expect($location.path()).toBe('/rrhhs/' + sampleRrhhResponse._id);
		}));

		it('$scope.update() should update a valid Rrhh', inject(function(Rrhhs) {
			// Define a sample Rrhh put data
			var sampleRrhhPutData = new Rrhhs({
				_id: '525cf20451979dea2c000001',
				name: 'New Rrhh'
			});

			// Mock Rrhh in scope
			scope.rrhh = sampleRrhhPutData;

			// Set PUT response
			$httpBackend.expectPUT(/api\/rrhhs\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/rrhhs/' + sampleRrhhPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid rrhhId and remove the Rrhh from the scope', inject(function(Rrhhs) {
			// Create new Rrhh object
			var sampleRrhh = new Rrhhs({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Rrhhs array and include the Rrhh
			scope.rrhhs = [sampleRrhh];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/api\/rrhhs\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleRrhh);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.rrhhs.length).toBe(0);
		}));
	});
}());