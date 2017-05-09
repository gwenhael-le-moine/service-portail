'use strict';

angular.module( 'portailApp' )
    .component( 'profilactif',
                { bindings: { user: '<' },
                  templateUrl: 'app/js/components/profil_actif.html',
                  controller: [ '$state', '$stateParams',
                                function( $state, $stateParams ) {
                                    var ctrl = this;

                                    ctrl.apply_change = function() {
                                        ctrl.user.$change_profil_actif( { profil_id: ctrl.user.profil_actif.profil_id,
                                                                          uai: ctrl.user.profil_actif.etablissement_code_uai } )
                                            .then( function() {
                                                $state.transitionTo( $state.current, $stateParams, { reload: true, inherit: true, notify: true } );
                                            });
                                    };
                                } ]
                } );
