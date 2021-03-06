angular.module('ELBWizard', [
    'ngRoute', 'TagEditorModule', 'ELBListenerEditorModule', 'localytics.directives',
    'ELBSecurityPolicyEditorModule', 'ELBCertificateEditorModule', 'ModalModule',
    'InstancesSelectorModule', 'EucaConsoleUtils', 'InstancesServiceModule',
    'ZonesServiceModule', 'VPCServiceModule', 'ELBServiceModule', 'BucketServiceModule',
    'ModalModule', 'CreateBucketModule', 'ELBServiceModule'
])
.directive('elbWizard', function () {
    return {
        restrict: 'A',
        scope: {
            cloudType: '@',
            vpcEnabled: '@',
        },
        controller: ['$scope', function ($scope) {
            var steps = [
                {
                    label: 'General',
                    href: '/elbs/wizard/',
                    vpcOnly: false,
                    complete: false
                },
                {
                    label: 'Network',
                    href: '/elbs/wizard/network',
                    vpcOnly: true,
                    complete: false
                },
                {
                    label: 'Instances',
                    href: '/elbs/wizard/instances',
                    vpcOnly: false,
                    complete: false
                },
                {
                    label: 'Health Check & Advanced',
                    href: '/elbs/wizard/advanced',
                    vpcOnly: false,
                    complete: false
                }
            ];

            this.validSteps = function () {
                var validSteps = steps.filter(function (current) {
                    if($scope.cloudType === 'aws' || $scope.vpcEnabled) {
                        return true;
                    } else {
                        return !current.vpcOnly;
                    }
                });
                return validSteps;
            };
        }],
        controllerAs: 'wizard'
    };
})
.factory('ELBWizardService', ['$location', 'WizardService', function ($location, WizardService) {

    var svc = {
        certsAvailable: [],
        policies: [],
        values: {
            elbName: '',
            listeners: [{
                'fromPort': 80,
                'toPort': 80,
                'fromProtocol': 'HTTP',
                'toProtocol': 'HTTP',
                'certificateArn': ''
            }],
            policy: {
                predefinedPolicy: '',
                predefinedPolicyChoices: [],
                sslUsingCustomPolicy: undefined
            },
            tags: [],
            vpcNetwork: 'None',
            vpcNetworkChoices: [],
            vpcSubnets: [],
            vpcSubnetChoices: [],
            vpcSecurityGroups: [],
            vpcSecurityGroupChoices: [],
            instances: [],
            availabilityZones: [],
            availabilityZoneChoices: [],
            pingProtocol: 'HTTP',
            pingPort: 80,
            pingPath: '/',
            responseTimeout: 5,
            timeBetweenPings: '30',
            failuresUntilUnhealthy: '2',
            passesUntilHealthy: '2',
            loggingEnabled: false,
            bucketName: '',
            bucketPrefix: '',
            collectionInterval: '5'
        },

        next: function (params) {
            angular.merge(this.values, params);
            WizardService.next();
        },

        displaySummary: function(step) {
            var nav = WizardService.getNav();
            if(!nav) {
                return false;
            }
            return nav.steps[step].complete || nav.steps[step] === nav.current;
        },

        submit: function () {
        }
    };
    return svc;
}])
.directive('focusOnLoad', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, elem) {
            $timeout(function () {
                elem[0].focus();
            });
        }
    };
})
.directive('summaryPane', function() {
    return {
        restrict: 'E',
        templateUrl: '/_template/elbs/wizard/summary',
        controller: ['ELBWizardService', function (ELBWizardService) {
            this.values = ELBWizardService.values;
            this.nav = ELBWizardService.nav;
            this.displaySummary = ELBWizardService.displaySummary;
        }],
        controllerAs: 'summary'
    };
})
.directive('fetchData', function(ELBService, InstancesService, ZonesService, VPCService, ELBWizardService, eucaHandleError) {
    return {
        restrict: 'E',
        link: function(scope, elem, attrs) {
            // load certificates
            ELBService.getPolicies().then(
                function success(result) {
                    result.forEach(function(val) {
                        ELBWizardService.values.policy.predefinedPolicyChoices.push(val); 
                    });
                    ELBWizardService.values.policy.predefinedPolicy = result[0];
                },
                function error(errData) {
                    eucaHandleError(errData.data.message, errData.status);
                });
            if (attrs.isVpc === 'True') {
                // load vpcs, subnets, groups
                VPCService.getVPCNetworks().then(
                    function success(result) {
                        result.forEach(function(val) {
                            ELBWizardService.values.vpcNetworkChoices.push(val); 
                        });
                        ELBWizardService.values.vpcNetwork = ELBWizardService.values.vpcNetworkChoices[0];
                    },
                    function error(errData) {
                        eucaHandleError(errData.data.message, errData.status);
                    });
                VPCService.getVPCSubnets().then(
                    function success(result) {
                        result.forEach(function(val) {
                            val.labelBak = val.label;
                            ELBWizardService.values.vpcSubnetChoices.push(val); 
                        });
                    },
                    function error(errData) {
                        eucaHandleError(errData.data.message, errData.status);
                    });
                VPCService.getVPCSecurityGroups().then(
                    function success(result) {
                        result.forEach(function(val) {
                            ELBWizardService.values.vpcSecurityGroupChoices.push(val);
                            if (val.label === 'default') {
                                ELBWizardService.values.vpcSecurityGroups.push(val);
                            }
                        });
                    },
                    function error(errData) {
                        eucaHandleError(errData.data.message, errData.status);
                    });
            }
            else {
                // load zones
                ZonesService.getZones().then(
                    function success(result) {
                        result.forEach(function(val) {
                            ELBWizardService.values.availabilityZoneChoices.push(val); 
                        });
                    },
                    function error(errData) {
                        eucaHandleError(errData.data.message, errData.status);
                    });
            }
            InstancesService.getInstances($('#csrf_token').val()).then(
                function success(result) {
                    result.forEach(function(val) {
                        ELBWizardService.values.instances.push(val); 
                    });
                },
                function error(errData) {
                    eucaHandleError(errData.data.message, errData.status);
                });
        }
    };
})
.config(function ($routeProvider, $locationProvider) {
    var certificatePromise;

    $routeProvider
        .when('/elbs/wizard/', {
            templateUrl: '/_template/elbs/wizard/general',
            controller: 'GeneralController',
            controllerAs: 'general',
            resolve: {
                policies: function ($q) {
                    return $q.when('foo');
                },
                certificates: ['CertificateService', function (CertificateService) {
                    if(!certificatePromise) {
                        certificatePromise = CertificateService.getCertificates();
                    }
                    return certificatePromise;
                }]
            }
        })
        .when('/elbs/wizard/network', {
            templateUrl: '/_template/elbs/wizard/network',
            controller: 'NetworkController',
            controllerAs: 'network'
        })
        .when('/elbs/wizard/instances', {
            templateUrl: '/_template/elbs/wizard/instances',
            controller: 'InstancesController',
            controllerAs: 'instances'
        })
        .when('/elbs/wizard/advanced', {
            templateUrl: '/_template/elbs/wizard/advanced',
            controller: 'AdvancedController',
            controllerAs: 'advanced'
        });

    $locationProvider.html5Mode({enabled:true, requireBase:false, rewriteLinks:true});
});
