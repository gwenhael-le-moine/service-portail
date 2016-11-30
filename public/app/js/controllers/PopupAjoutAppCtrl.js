'use strict';

angular.module( 'portailApp' )
    .controller( 'PopupAjoutAppCtrl',
                 [ '$scope', '$uibModalInstance', 'APP_PATH', 'Apps', 'RessourceNumerique', 'currentUser',
                   'current_tiles', 'inactive_tiles',
                   function( $scope, $uibModalInstance, APP_PATH, Apps, RessourceNumerique, currentUser,
                             current_tiles, inactive_tiles ) {
                       $scope.prefix = APP_PATH;

                       $scope.available_tiles = [];
                       $scope.tiles_selected = false;

                       $scope.add_empty_link_tile = function() {
                           $scope.available_tiles.push( new Apps( { creation: true,
                                                                    present: false,
                                                                    type: 'EXTERNAL',
                                                                    libelle: '',
                                                                    description: '',
                                                                    url: 'http://',
                                                                    color: '',
                                                                    active: true,
                                                                    selected: true,
                                                                    taxonomy: 'app'} ) );
                       };

                       $scope.keep_tile_selected = function( event, app ) {
                           app.selected = false; // opposite of what we want
                           $scope.selected( app );
                           event.stopImmediatePropagation();
                       };

                       $scope.selected = function( tile ) {
                           tile.selected = !tile.selected;
                           $scope.tiles_selected = _($scope.available_tiles).select( { selected: true } ).length > 0;
                       };

                       $scope.ok = function () {
                           $uibModalInstance.close( _($scope.available_tiles).select( { selected: true } ) );
                       };

                       $scope.cancel = function () {
                           $uibModalInstance.dismiss();
                       };

                       Apps.query_defaults().$promise
                           .then( function( response ) {
                               $scope.available_tiles = $scope.available_tiles.concat( _.chain( inactive_tiles.concat( _(response).where({ active: true }) ) )
                                                                                       .uniq( function( app ) { return app.application_id; } )
                                                                                       .each( function( app ) {
                                                                                           app.taxonomy = 'app';
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
                                                                                       .value() );
                           } );

                       // RessourceNumerique.query().$promise
                       //     .then( function( response ) {
                       //         currentUser.ressources().then( function ( active_ressources ) {
                       //             var active_ressources_descriptions = active_ressources.map( function( rn ) {
                       //                 return rn.description;
                       //             } );
                       //             $scope.available_tiles = $scope.available_tiles.concat( _(response)
                       //                                                                     .reject( function( rn ) {
                       //                                                                         return active_ressources_descriptions.indexOf( rn.nom_court ) !== -1;
                       //                                                                     } )
                       //                                                                     .map( function( rn ) {
                       //                                                                         rn.taxonomy = 'rn';
                       //                                                                         rn.description = rn.lib;
                       //                                                                         rn.libelle = rn.nom_court;
                       //                                                                         rn.url = rn.url_access_get;
                       //                                                                         rn.color = 'orange-brillant';
                       //                                                                         rn.available = function() { return true; };

                       //                                                                         return rn;
                       //                                                                     } ) );
                       //         } );
                       //     } );
                   } ] );
