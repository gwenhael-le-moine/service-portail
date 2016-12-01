'use strict';

angular.module( 'portailApp' )
    .controller( 'PopupConfigNewsFluxesCtrl',
                 [ '$scope', '$uibModalInstance', 'Flux', 'CONFIG',
                   function( $scope, $uibModalInstance, Flux, CONFIG ) {
                       Flux.query().$promise.then( function( response ) {
                           $scope.current_flux = _(response).map( function( flux ) {
                               flux.dirty = false;

                               if ( flux.default ) {
                                   $scope.save( flux );
                               }

                               return flux;
                               } );
                       } );

                       $scope.minutes = _.range( 1, 11 );

                       $scope.delete = function( flux ) {
                           flux.$delete();
                           $scope.current_flux = _($scope.current_flux).difference( [ flux ] );
                       };

                       $scope.save = function( flux ) {
                           _(flux).has( 'id' ) ? flux.$update() : flux.$save();
                       };

                       $scope.dirtify = function( flux ) {
                           flux.dirty = true;
                       };

                       $scope.add_flux = function() {
                           $scope.current_flux.push( new Flux( {
                               nb: 1,
                               title: '',
                               flux: '',
                               icon: ''
                           } ) );
                       };

                       $scope.add_default_flux = function() {
                           _(CONFIG.news_feed).each( function( flux ) {
                               $scope.current_flux.push( new Flux( flux ) );
                           } );
                       };

                       $scope.close = function () {
                           $uibModalInstance.close();
                       };
                   } ] );
