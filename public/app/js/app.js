'use strict';

// Declare app level module which depends on filters, and services
angular.module( 'portailApp', [ 'ngResource',
                                'ui.router',
                                'ui.bootstrap',
                                'as.sortable',
                                'ui.checkbox',
                                'ngTouch',
                                'ngAnimate',
                                'angularMoment',
                                'ngColorPicker',
                                'angular-carousel',
                                'toastr',
                                'ngFitText',
                                'angular-loading-bar' ] )
    .config( [ '$stateProvider', '$urlRouterProvider', 'APP_PATH',
               function ( $stateProvider, $urlRouterProvider, APP_PATH ) {
                   $urlRouterProvider.otherwise( '/' );

                   var get_current_user = [ '$rootScope', 'currentUser',
                                            function( $rootScope, currentUser ) {
                                                return currentUser.get( false )
                                                    .then( function( response ) {
                                                        $rootScope.current_user = response;

                                                        return response;
                                                    } );
                                            } ];

                   $stateProvider
                       .state( 'portail', {
                           resolve: { current_user: get_current_user },
                           templateUrl: 'views/index.html',
                           controller: 'PortailCtrl'
                       } )
                       .state( 'portail.logged',
                               { parent: 'portail',
                                 url: '/',
                                 views: {
                                     'main': {
                                         templateUrl: 'views/tiles.html',
                                         controller: 'TilesCtrl'
                                     }
                                 }
                               } )
                       .state( 'portail.user',
                               { parent: 'portail',
                                 url: '/user',
                                 views: {
                                     'main': {
                                         templateUrl: 'views/user.html',
                                         controller: 'ModificationUserCtrl'
                                     }
                                 }
                               } )
                       .state( 'app',
                               { resolve: { current_user: get_current_user },
                                 url: '/app',
                                 templateUrl: 'views/app-wrapper.html',
                                 controller: 'AppWrapperCtrl'
                               } )
                       .state( 'app.external',
                               { parent: 'app',
                                 url: '/external/:app',
                                 views: {
                                     'app': {
                                         templateUrl: 'views/iframe.html',
                                         controller: 'IframeCtrl'
                                     }
                                 }
                               } )
                       .state( 'app.trombinoscope',
                               { parent: 'app',
                                 url: '/trombinoscope',
                                 views: {
                                     'app': {
                                         templateUrl: 'views/trombinoscope.html',
                                         controller: 'TrombinoscopeCtrl'
                                     }
                                 }
                               } )
                       .state( 'app.ressources-numeriques',
                               { parent: 'app',
                                 url: '/ressources-numeriques',
                                 views: {
                                     'app': {
                                         templateUrl: 'views/ressources_numeriques.html',
                                         controller: 'RessourcesNumeriquesCtrl'
                                     }
                                 }
                               } )
                       .state( 'app.classes-culturelles-numeriques',
                               { parent: 'app',
                                 url: '/classes-culturelles-numeriques',
                                 views: {
                                     'app': {
                                         templateUrl: 'views/ccn.html',
                                         controller: 'CCNCtrl'
                                     }
                                 }
                               } );
               }
             ] )
    .run( [ '$rootScope', 'log',
            function( $rootScope, log ) {
                $rootScope.modification = false;
                $rootScope.$on( '$stateChangeSuccess',
                                function( event, toState, toParams, fromState, fromParams ) {
                                    var app = 'PORTAIL';
                                    if ( _(toParams).has('app') ) {
                                        app = toParams.app;
                                    } else if ( toState.name == 'app.trombinoscope' ) {
                                        app = 'TROMBINOSCOPE';
                                    }
                                    log.add( app, null, null );
                                } );
            }
          ] );
