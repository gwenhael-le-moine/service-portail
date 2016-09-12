'use strict';

angular.module( 'portailApp' )
    .controller( 'AppWrapperCtrl',
                 [ '$scope', '$rootScope', '$state', 'APP_PATH', 'Utils', 'current_user',
                   function ( $scope, $rootScope, $state, APP_PATH, Utils, current_user ) {
                       $scope.iOS = ( navigator.userAgent.match( /iPad/i ) !== null ) || ( navigator.userAgent.match( /iPhone/i ) !== null );
                       $scope.prefix = APP_PATH;

                       $scope.go_home = function() {
                           Utils.go_home();
                       };
                   }
                 ] );
