'use strict';

angular.module( 'portailApp' )
    .controller( 'PopupAjoutAppCtrl',
                 [ '$scope', '$uibModalInstance', 'APP_PATH', 'Apps', 'current_tiles', 'inactive_tiles',
                   function( $scope, $uibModalInstance, APP_PATH, Apps, current_tiles, inactive_tiles ) {
                       $scope.prefix = APP_PATH;
                       $scope.apps_selected = false;

                       $scope.add_empty_link_tile = function() {
                           $scope.apps.push( new Apps( { creation: true,
                                                         present: false,
                                                         type: 'EXTERNAL',
                                                         libelle: '',
                                                         description: '',
                                                         url: 'http://',
                                                         color: '',
                                                         active: true,
                                                         selected: true } ) );
                       };

                       $scope.keep_app_selected = function( event, app ) {
                           app.selected = false; // opposite of what we want
                           $scope.selected( app );
                           event.stopImmediatePropagation();
                       };

                       $scope.selected = function( app ) {
                           app.selected = !app.selected;
                           $scope.apps_selected = _($scope.apps).select( { selected: true } ).length > 0;
                       };

                       $scope.ok = function () {
                           $uibModalInstance.close( _($scope.apps).select( { selected: true } ) );
                       };

                       $scope.cancel = function () {
                           $uibModalInstance.dismiss();
                       };

                       Apps.query_default().$promise
                           .then( function( response ) {
                               $scope.apps = _.chain( inactive_tiles.concat( response ) )
                                   .uniq( function( app ) { return app.application_id; } )
                                   .each( function( app ) {
                                       app.available = function() {
                                           return !_.chain(current_tiles)
                                               .reject( function( a ) {
                                                   return a.to_delete;
                                               } )
                                               .pluck( 'application_id' )
                                               .contains( app.application_id )
                                               .value();
                                       };
                                   } )
                                   .value();
                           } );
                   } ] );
