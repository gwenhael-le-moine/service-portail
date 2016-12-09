'use strict';

angular.module( 'portailApp' )
    .component( 'profilactif',
                { bindings: { user: '=' },
                  template: '<select ' +
                  'ng:model="$ctrl.new_profil"' +
                  'ng:change="$ctrl.apply_change( $ctrl.new_profil )"' +
                  'ng:options="profil as profil.etablissement_nom + \' : \' + profil.profil_nom group by profil.etablissement_nom for profil in $ctrl.user.profils track by $index" >' +
                  '</select>',
                  controller: [ '$state', '$stateParams',
                                function( $state, $stateParams ) {
                                    var ctrl = this;

                                    ctrl.new_profil = angular.copy( ctrl.user.profil_actif );
                                    console.log(ctrl.new_profil)

                                    ctrl.apply_change = function( new_profil ) {
                                        console.log(new_profil)
                                        ctrl.user.$change_profil_actif( { profil_id: new_profil.profil_id,
                                                                          uai: new_profil.etablissement_code_uai } )
                                            .then( function() {
                                                $state.transitionTo( $state.current, $stateParams, { reload: true, inherit: true, notify: true } );
                                            });
                                    };
                                } ]
                } );
