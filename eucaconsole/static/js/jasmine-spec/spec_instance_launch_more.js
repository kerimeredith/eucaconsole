/**
 * Copyright 2016 Hewlett Packard Enterprise Development LP
 *
 * @fileOverview Jasmine Unittest for Instance Launch More JS 
 * @requires Jasmine, AngularJS mock
 *
 */

describe("LaunchMoreInstances", function() {

    beforeEach(angular.mock.module('LaunchMoreInstances'));

    var scope, ctrl;
    // inject the $controller and $rootScope services
    // in the beforeEach block
    beforeEach(angular.mock.inject(function($controller, $rootScope) {
        // Create a new scope that's a child of the $rootScope
        scope = $rootScope.$new();
        // Create the controller
        ctrl = $controller('LaunchMoreInstancesCtrl', {
            $scope: scope
        });
    }));

    beforeEach(function() {
        var template = window.__html__['templates/instances/instance_launch_more.pt'];
        // remove <script src> and <link> tags to avoid phantomJS error
        template = template.replace(/script src/g, "script ignore_src"); 
        template = template.replace(/<link/g, "<ignore_link"); 
        setFixtures(template);
    });

    describe("Initial Values Test", function() {

        it("should set initial value of instanceNumber to 1", function() {
            expect(scope.instanceNumber).toEqual(1);
        });

        it("should set initial value of expanded to false", function() {
            expect(scope.expanded).toBe(false);
        });
    });

    describe("#initController", function() {

        it("should call setInitialValues() when initController() is called", function() {
            spyOn(scope, 'setInitialValues');
            scope.initController();
            expect(scope.setInitialValues).toHaveBeenCalled();
        });
    });
});
