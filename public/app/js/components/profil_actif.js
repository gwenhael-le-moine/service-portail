'use strict';

angular.module( 'portailApp' )
    .component( 'profilactif',
                { bindings: { user: '<' },
                  templateUrl: 'app/js/components/profil_actif.html',
                  controller: [ '$http', '$state', '$stateParams', 'currentUser', 'URL_ENT',
                                function( $http, $state, $stateParams, currentUser, URL_ENT ) {
                                    var ctrl = this;

                                    var get_structure = _.memoize( function( structure_id ) {
                                        return $http.get( URL_ENT + '/api/structures/' + structure_id );
                                    } );

                                    var get_profile_type = _.memoize( function( type ) {
                                        return $http.get( URL_ENT + '/api/profiles_types/' + type );
                                    } );

                                    ctrl.apply_change = function() {
                                        currentUser.activate_profile( ctrl.current_profile.id )
                                            .then( function() {
                                                ctrl.$onInit();
                                                $state.transitionTo( $state.current, $stateParams, { reload: true, inherit: true, notify: true } );
                                            });
                                    };

                                    ctrl.$onInit = function() {
                                        ctrl.user.profiles.forEach( function( profile ) {
                                            get_structure( profile.structure_id )
                                                .then( function( response ) {
                                                    profile.structure = response.data;
                                                } );
                                            get_profile_type( profile.type )
                                                .then( function( response ) {
                                                    profile.profile = response.data;
                                                } );
                                        } );

                                        ctrl.current_profile = ctrl.user.active_profile();
                                    };
                                } ]
                } );
