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
                                'angular-loading-bar' ] )
    .config( [ '$stateProvider', '$urlRouterProvider', 'APP_PATH',
               function ( $stateProvider, $urlRouterProvider, APP_PATH ) {
                   var get_current_user = [ '$rootScope', 'currentUser',
                                            function( $rootScope, currentUser ) {
                                                return currentUser.get( false )
                                                    .then( function( response ) {
                                                        $rootScope.current_user = response;
                                                        $rootScope.current_user.edit_profile = false;

                                                        return $rootScope.current_user;
                                                    } );
                                            } ];

                   $stateProvider
                       .state( 'portail',
                               { url: '/',
                                 templateUrl: 'views/portail.html',
                                 resolve: { current_user: get_current_user },
                                 controller: 'PortailCtrl' } )
                       .state( 'app',
                               { resolve: { current_user: get_current_user,
                                            prefix: function() { return APP_PATH; } },
                                 url: '/app/:appid',
                                 templateUrl: 'views/app-wrapper.html',
                                 controller: [ '$scope', '$stateParams',
                                               function( $scope, $stateParams ) {
                                                   $scope.appid = $stateParams.appid;
                                               } ] } );

                   $urlRouterProvider.otherwise( '/' );
                             }
             ] )
    .config( [ '$httpProvider',
               function( $httpProvider ) {
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
