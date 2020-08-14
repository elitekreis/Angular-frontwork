'use strict';

(function() {
	// Areas Controller Spec
	describe('Areas Controller Tests', function() {
		// Initialize global variables
		var AreasController,
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

			// Initialize the Areas controller.
			AreasController = $controller('AreasController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Area object fetched from XHR', inject(function(Areas) {
			// Create sample Area using the Areas service
			var sampleArea = new Areas({
				name: 'New Area'
			});

			// Create a sample Areas array that includes the new Area
			var sampleAreas = [sampleArea];

			// Set GET response
			$httpBackend.expectGET('api/areas').respond(sampleAreas);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.areas).toEqualData(sampleAreas);
		}));

		it('$scope.findOne() should create an array with one Area object fetched from XHR using a areaId URL parameter', inject(function(Areas) {
			// Define a sample Area object
			var sampleArea = new Areas({
				name: 'New Area'
			});

			// Set the URL parameter
			$stateParams.areaId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/api\/areas\/([0-9a-fA-F]{24})$/).respond(sampleArea);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.area).toEqualData(sampleArea);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Areas) {
			// Create a sample Area object
			var sampleAreaPostData = new Areas({
				name: 'New Area'
			});

			// Create a sample Area response
			var sampleAreaResponse = new Areas({
				_id: '525cf20451979dea2c000001',
				name: 'New Area'
			});

			// Fixture mock form input values
			scope.name = 'New Area';

			// Set POST response
			$httpBackend.expectPOST('api/areas', sampleAreaPostData).respond(sampleAreaResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Area was created
			expect($location.path()).toBe('/areas/' + sampleAreaResponse._id);
		}));

		it('$scope.update() should update a valid Area', inject(function(Areas) {
			// Define a sample Area put data
			var sampleAreaPutData = new Areas({
				_id: '525cf20451979dea2c000001',
				name: 'New Area'
			});

			// Mock Area in scope
			scope.area = sampleAreaPutData;

			// Set PUT response
			$httpBackend.expectPUT(/api\/areas\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/areas/' + sampleAreaPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid areaId and remove the Area from the scope', inject(function(Areas) {
			// Create new Area object
			var sampleArea = new Areas({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Areas array and include the Area
			scope.areas = [sampleArea];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/api\/areas\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleArea);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.areas.length).toBe(0);
		}));
	});
}());