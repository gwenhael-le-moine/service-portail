'use strict';

angular.module( 'portailApp' )
    .component( 'profilactif',
                { bindings: { user: '<' },
                  templateUrl: 'app/js/components/profil_actif.html',
                  controller: [ '$state', '$stateParams', 'currentUser',
                                function( $state, $stateParams, currentUser ) {
                                    var ctrl = this;

                                    ctrl.apply_change = function() {
                                        currentUser.activate_profile( ctrl.current_profile.id )
                                            .then( function() {
                                                $state.transitionTo( $state.current, $stateParams, { reload: true, inherit: true, notify: true } );
                                            });
                                    };

                                    ctrl.$onInit = function() {
                                        ctrl.current_profile = ctrl.user.active_profile();
                                    };
                                } ]
                } );
