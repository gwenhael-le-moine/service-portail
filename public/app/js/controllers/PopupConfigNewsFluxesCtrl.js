'use strict';

angular.module( 'portailApp' )
    .controller( 'PopupConfigNewsFluxesCtrl',
                 [ '$scope', '$uibModalInstance', 'currentUser', 'Flux', 'CONFIG',
                   function( $scope, $uibModalInstance, currentUser, Flux, CONFIG ) {
                       var ctrl = $scope;
                       ctrl.$ctrl = ctrl;

                       ctrl.nb_articles = _.range( 1, 11 );
                       ctrl.current_flux = [];

                       ctrl.delete = function( flux ) {
                           flux.$delete();
                           ctrl.current_flux = _(ctrl.current_flux).difference( [ flux ] );
                       };

                       ctrl.save = function( flux ) {
                           flux.structure_id = ctrl.user.active_profile().structure_id;
                           return _(flux).has( 'id' ) ? flux.$update() : flux.$save();
                       };

                       ctrl.dirtify = function( flux ) {
                           flux.dirty = true;
                       };

                       ctrl.add_flux = function() {
                           ctrl.current_flux.push( new Flux( { nb: 1,
                                                               name: '',
                                                               url: '',
                                                               icon: '' } ) );
                       };

                       ctrl.add_default_flux = function() {
                           _(CONFIG.news_feed).each( function( flux ) {
                               ctrl.save( flux ).then( function( response ) {
                                   ctrl.current_flux.push( response );
                               } );
                           } );
                       };

                       ctrl.close = function () {
                           $uibModalInstance.close();
                       };

                       ctrl.$onInit = function() {
                           currentUser.get( false ).then( function( user ) {
                               ctrl.user = user;

                               Flux.get({ structure_id: ctrl.user.active_profile().structure_id }).$promise
                                   .then( function( response ) {
                                       ctrl.current_flux.push( _(response).map( function( flux ) {
                                           flux.dirty = false;

                                           return flux;
                                       } ) );
                                   } );
                           } );
                       };

                       ctrl.$onInit();
                   } ] );
