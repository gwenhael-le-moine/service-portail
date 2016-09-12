'use strict';

angular.module( 'portailApp' )
    .controller( 'TrombinoscopeCtrl',
                 [ '$scope', '$state', 'currentUser', 'COULEURS', 'apps', 'Utils',
                   function( $scope, $state, currentUser, COULEURS, apps, Utils ) {
                       apps.query()
                           .then( function ( response ) {
                               if ( _.chain( response ).findWhere( { application_id: 'TROMBI' } ).isUndefined().value() ) {
                                   Utils.go_home();
                               }

                               $scope.filters = {
                                   regroupements_types: { classes: true,
                                                          groupes_eleves: false },
                                   text: { regroupement: '',
                                           user: '' },
                                   order_asc: true
                               };

                               $scope.actions = {
                                   regroupement: [
                                       // {
                                       //          glyphicon: 'envelope',
                                       //          tooltip: 'Écrire un email',
                                       //          do: function( regroupement ) {
                                       //              console.log( 'Gonna send a nice email to ' + regroupement.libelle );
                                       //          }
                                       // },
                                       // {
                                       //          glyphicon: 'calendar',
                                       //          tooltip: 'Ouvrir le cahier de textes',
                                       //          do: function( regroupement ) {
                                       //              console.log( 'Gonna show the CTXT for ' + regroupement.libelle );
                                       //          }
                                       // }
                                   ],
                                   people: [
                                       // {
                                       //          glyphicon: 'envelope',
                                       //          tooltip: 'Écrire un email',
                                       //          do: function( people ) {
                                       //              console.log( 'Gonna send a nice email to ' + people.prenom + ' ' + people.nom );
                                       //          }
                                       // },
                                       // {
                                       //          glyphicon: 'refresh',
                                       //          tooltip: 'Ouvrir le suivi',
                                       //          do: function( people ) {
                                       //              console.log( 'Gonna show the SUIVI for ' + people.prenom + ' ' + people.nom );
                                       //          }
                                       // }
                                   ]
                               };

                               currentUser.regroupements().then( function ( response ) {
                                   $scope.regroupements = response;

                                   $scope.showElevesRegroupement = function( regroupement ) {
                                       $scope.regroupement = regroupement;
                                       currentUser.eleves_regroupement( regroupement.id )
                                           .then( function( response ) {
                                               $scope.eleves = response;
                                           } );
                                   };

                                   $scope.retour = function() {
                                       $scope.eleves = undefined;
                                       $scope.regroupement = undefined;
                                   };
                               } );
                           } );
                   }
                 ]
               );
