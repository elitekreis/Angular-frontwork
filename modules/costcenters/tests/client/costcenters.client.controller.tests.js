'use strict';

(function() {
	// Costcenters Controller Spec
	describe('Costcenters Controller Tests', function() {
		// Initialize global variables
		var CostcentersController,
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

			// Initialize the Costcenters controller.
			CostcentersController = $controller('CostcentersController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Costcenter object fetched from XHR', inject(function(Costcenters) {
			// Create sample Costcenter using the Costcenters service
			var sampleCostcenter = new Costcenters({
				name: 'New Costcenter'
			});

			// Create a sample Costcenters array that includes the new Costcenter
			var sampleCostcenters = [sampleCostcenter];

			// Set GET response
			$httpBackend.expectGET('api/costcenters').respond(sampleCostcenters);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.costcenters).toEqualData(sampleCostcenters);
		}));

		it('$scope.findOne() should create an array with one Costcenter object fetched from XHR using a costcenterId URL parameter', inject(function(Costcenters) {
			// Define a sample Costcenter object
			var sampleCostcenter = new Costcenters({
				name: 'New Costcenter'
			});

			// Set the URL parameter
			$stateParams.costcenterId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/api\/costcenters\/([0-9a-fA-F]{24})$/).respond(sampleCostcenter);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.costcenter).toEqualData(sampleCostcenter);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Costcenters) {
			// Create a sample Costcenter object
			var sampleCostcenterPostData = new Costcenters({
				name: 'New Costcenter'
			});

			// Create a sample Costcenter response
			var sampleCostcenterResponse = new Costcenters({
				_id: '525cf20451979dea2c000001',
				name: 'New Costcenter'
			});

			// Fixture mock form input values
			scope.name = 'New Costcenter';

			// Set POST response
			$httpBackend.expectPOST('api/costcenters', sampleCostcenterPostData).respond(sampleCostcenterResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Costcenter was created
			expect($location.path()).toBe('/costcenters/' + sampleCostcenterResponse._id);
		}));

		it('$scope.update() should update a valid Costcenter', inject(function(Costcenters) {
			// Define a sample Costcenter put data
			var sampleCostcenterPutData = new Costcenters({
				_id: '525cf20451979dea2c000001',
				name: 'New Costcenter'
			});

			// Mock Costcenter in scope
			scope.costcenter = sampleCostcenterPutData;

			// Set PUT response
			$httpBackend.expectPUT(/api\/costcenters\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/costcenters/' + sampleCostcenterPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid costcenterId and remove the Costcenter from the scope', inject(function(Costcenters) {
			// Create new Costcenter object
			var sampleCostcenter = new Costcenters({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Costcenters array and include the Costcenter
			scope.costcenters = [sampleCostcenter];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/api\/costcenters\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleCostcenter);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.costcenters.length).toBe(0);
		}));
	});
}());