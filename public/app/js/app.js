'use strict';

// Declare app level module which depends on filters, and services
angular.module( 'portailApp', [ 'ngResource',
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
                                'toastr' ] )
    .config( [ '$stateProvider', '$urlRouterProvider', '$locationProvider', 'APP_PATH',
               function ( $stateProvider, $urlRouterProvider, $locationProvider, APP_PATH ) {
                   // $locationProvider.html5Mode(true);

                   $stateProvider
                       .state( 'portail',
                               { url: '/',
                                 templateUrl: 'app/views/portail.html',
                                 controller: 'PortailCtrl' } )
                       .state( 'app',
                               { resolve: { prefix: function() { return APP_PATH; } },
                                 url: '/app/:appid',
                                 templateUrl: 'app/views/app-wrapper.html',
                                 controller: [ '$scope', '$stateParams', 'currentUser',
                                               function( $scope, $stateParams, currentUser ) {
                                                   var ctrl = $scope;

                                                   ctrl.appid = $stateParams.appid;

                                                   currentUser.get( false ).then( function( user ) {
                                                       ctrl.user = user;
                                                   } );
                                               }
                                             ] } );

                   $urlRouterProvider.otherwise( '/' );
               }
             ] )
    .config( [ '$httpProvider',
               function( $httpProvider ) {
                   $httpProvider.defaults.useXDomain = true;
                   $httpProvider.defaults.withCredentials = true;

                   $httpProvider.interceptors.push( [ '$q', '$window',
                                                      function( $q, $window ) {
                                                          return {
                                                              'responseError': function( rejection ) {
                                                                  if ( rejection.status === 401 ) {
                                                                      $window.location.href = '/sso/login?ticket=false&service=' + encodeURIComponent( $window.location.href );
                                                                  }
                                                                  return rejection;
                                                              }
                                                          };
                                                      } ] );
               }] )
    .run( [ '$rootScope', 'log',
            function( $rootScope, log ) {
                $rootScope.modification = false;
                $rootScope.$on( '$stateChangeSuccess',
                                function( event, toState, toParams, fromState, fromParams ) {
                                    log.add( ( toState.name == 'app' ) ? toParams.appid : 'PORTAIL' , null, null );
                                } );
            }
          ] );
