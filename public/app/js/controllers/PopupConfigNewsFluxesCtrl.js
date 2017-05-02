'use strict';

angular.module( 'portailApp' )
    .controller( 'PopupConfigNewsFluxesCtrl',
                 [ '$scope', '$rootScope', '$uibModalInstance', 'currentUser', 'Flux', 'CONFIG',
                   function( $scope, $rootScope, $uibModalInstance, currentUser, Flux, CONFIG ) {
                       var ctrl = $scope;

                       currentUser.get( false ).then( function( user ) {
                           console.log(user)
                           Flux.get({ etab_code_uai: user.profil_actif.etablissement_code_uai }).$promise
                               .then( function( response ) {
                                   console.log(response)
                                   ctrl.current_flux = _(response).map( function( flux ) {
                                       flux.dirty = false;

                                       return flux;
                                   } );
                           } );
                       } );

                       ctrl.nb_articles = _.range( 1, 11 );

                       ctrl.delete = function( flux ) {
                           flux.$delete();
                           ctrl.current_flux = _(ctrl.current_flux).difference( [ flux ] );
                       };

                       ctrl.save = function( flux ) {
                           flux.etab_code_uai = $rootScope.current_user.profil_actif.etablissement_code_uai;
                           return _(flux).has( 'id' ) ? flux.$update() : flux.$save();
                       };

                       ctrl.dirtify = function( flux ) {
                           flux.dirty = true;
                       };

                       ctrl.add_flux = function() {
                           ctrl.current_flux.push( new Flux( { nb: 1,
                                                               title: '',
                                                               flux: '',
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
                   } ] );
