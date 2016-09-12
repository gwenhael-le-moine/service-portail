'use strict';

angular.module( 'portailApp' )
    .controller( 'IframeCtrl',
                 [ '$scope', '$stateParams', '$sce', '$state', 'apps', 'Utils',
                   function ( $scope, $stateParams, $sce, $state, apps, Utils ) {
                       apps.query()
                           .then( function ( response ) {
                               // Toutes les applications en iframe
                               var app = _( response ).findWhere( { application_id: $stateParams.app } );

                               if ( _(app).isUndefined() ) {
                                   Utils.go_home();
                               } else {
                                   $scope.app = { nom: app.nom,
                                                  url: $sce.trustAsResourceUrl( app.url ) };
                               }
                           } );
                   }
                 ] );
