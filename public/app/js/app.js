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
                                'zxcvbn' ] )
    .config( [ '$stateProvider', '$urlRouterProvider', 'APP_PATH',
               function ( $stateProvider, $urlRouterProvider, APP_PATH ) {
                   $stateProvider
                       .state( 'portail',
                               { url: '/',
                                 templateUrl: 'app/views/portail.html',
                                 controller: 'PortailCtrl' } )
                       .state( 'app',
                               { resolve: { prefix: function() { return APP_PATH; } },
                                 url: '/app/:appid',
                                 templateUrl: 'app/views/app-wrapper.html',
                                 controller: [ '$scope', '$stateParams',
                                               function( $scope, $stateParams ) {
                                                   $scope.appid = $stateParams.appid;
                                               } ] } );

                   $urlRouterProvider.otherwise( '/' );
               }
             ] )
    .config( [ '$httpProvider',
               function( $httpProvider ) {
                   $httpProvider.defaults.useXDomain = true;
                   $httpProvider.defaults.withCredentials = true;
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
