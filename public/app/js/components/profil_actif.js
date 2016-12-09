'use strict';

angular.module( 'portailApp' )
    .component( 'profilactif',
                { bindings: { user: '=' },
                  template: '<select ' +
                  'ng:model="$ctrl.user.profil_actif"' +
                  'ng:change="$ctrl.apply_change()"' +
                  'ng:options="profil as profil.etablissement_nom + \' : \' + profil.profil_nom group by profil.etablissement_nom for profil in $ctrl.user.profils track by profil.index" >' +
                  '</select>',
                  controller: [ '$state', '$stateParams',
                                function( $state, $stateParams ) {
                                    var ctrl = this;

                                    ctrl.user.profils.forEach( function( profil, index ) {
                                        profil.index = index;
                                    } );
                                    ctrl.user.profil_actif = _(ctrl.user.profils).findWhere({ actif: true });

                                    ctrl.apply_change = function() {
                                        ctrl.user.$change_profil_actif( { profil_id: ctrl.user.profil_actif.profil_id,
                                                                          uai: ctrl.user.profil_actif.etablissement_code_uai } )
                                            .then( function() {
                                                $state.transitionTo( $state.current, $stateParams, { reload: true, inherit: true, notify: true } );
                                            });
                                    };
                                } ]
                } );
