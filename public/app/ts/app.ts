'use strict';

// Declare app level module which depends on filters, and services
angular.module('portailApp', ['ngResource',
  'ui.router',
  'ui.bootstrap',
  'as.sortable',
  'ui.checkbox',
  'ngTouch',
  'angularMoment',
  'ngColorPicker',
  'angular-carousel',
  'ngFitText',
  'zxcvbn',
  'toastr'])
  .config(['$stateProvider', '$urlRouterProvider', '$locationProvider', 'APP_PATH',
    function($stateProvider, $urlRouterProvider, $locationProvider, APP_PATH) {
      $stateProvider
        .state('portail',
        {
          url: '/',
          component: 'portail'
        })
        .state('app',
        {
          url: '/app/:appid',
          component: 'appWrapper',
          resolve: {
            appId: ['$transition$',
              function($transition$) {
                return $transition$.params().appid;
              }]
          }
        });

      $urlRouterProvider.otherwise('/');
    }
  ])
  .config(['$httpProvider',
    function($httpProvider) {
      $httpProvider.defaults.useXDomain = true;
      $httpProvider.defaults.withCredentials = true;

      $httpProvider.interceptors.push(['$q', '$window',
        function($q, $window) {
          return {
            'responseError': function(rejection) {
              if (rejection.status === 401) {
                $window.location.href = '/sso/login?ticket=false&service=' + encodeURIComponent($window.location.href);
              }
              return rejection;
            }
          };
        }]);
    }]);
