'use strict';

(function() {
	// Subs Controller Spec
	describe('Subs Controller Tests', function() {
		// Initialize global variables
		var SubsController,
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

			// Initialize the Subs controller.
			SubsController = $controller('SubsController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Sub object fetched from XHR', inject(function(Subs) {
			// Create sample Sub using the Subs service
			var sampleSub = new Subs({
				name: 'New Sub'
			});

			// Create a sample Subs array that includes the new Sub
			var sampleSubs = [sampleSub];

			// Set GET response
			$httpBackend.expectGET('api/subs').respond(sampleSubs);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.subs).toEqualData(sampleSubs);
		}));

		it('$scope.findOne() should create an array with one Sub object fetched from XHR using a subId URL parameter', inject(function(Subs) {
			// Define a sample Sub object
			var sampleSub = new Subs({
				name: 'New Sub'
			});

			// Set the URL parameter
			$stateParams.subId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/api\/subs\/([0-9a-fA-F]{24})$/).respond(sampleSub);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.sub).toEqualData(sampleSub);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Subs) {
			// Create a sample Sub object
			var sampleSubPostData = new Subs({
				name: 'New Sub'
			});

			// Create a sample Sub response
			var sampleSubResponse = new Subs({
				_id: '525cf20451979dea2c000001',
				name: 'New Sub'
			});

			// Fixture mock form input values
			scope.name = 'New Sub';

			// Set POST response
			$httpBackend.expectPOST('api/subs', sampleSubPostData).respond(sampleSubResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Sub was created
			expect($location.path()).toBe('/subs/' + sampleSubResponse._id);
		}));

		it('$scope.update() should update a valid Sub', inject(function(Subs) {
			// Define a sample Sub put data
			var sampleSubPutData = new Subs({
				_id: '525cf20451979dea2c000001',
				name: 'New Sub'
			});

			// Mock Sub in scope
			scope.sub = sampleSubPutData;

			// Set PUT response
			$httpBackend.expectPUT(/api\/subs\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/subs/' + sampleSubPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid subId and remove the Sub from the scope', inject(function(Subs) {
			// Create new Sub object
			var sampleSub = new Subs({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Subs array and include the Sub
			scope.subs = [sampleSub];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/api\/subs\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleSub);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.subs.length).toBe(0);
		}));
	});
}());