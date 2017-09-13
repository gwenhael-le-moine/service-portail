'use strict';

angular.module( 'portailApp' )
    .component( 'profilactif',
                { bindings: { user: '<' },
                  controller: [ 'Annuaire', '$state', '$stateParams', 'currentUser',
                                function( Annuaire, $state, $stateParams, currentUser ) {
                                    var ctrl = this;

                                    ctrl.apply_change = function() {
                                        currentUser.activate_profile( ctrl.current_profile.id )
                                            .then( function() {
                                                $state.transitionTo( $state.current, $stateParams, { reload: true, inherit: true, notify: true } );
                                            });
                                    };

                                    ctrl.$onInit = function() {
                                        ctrl.user.profiles.forEach( function( profile ) {
                                            Annuaire.get_structure( profile.structure_id )
                                                .then( function( response ) {
                                                    profile.structure = response.data;
                                                } );
                                            Annuaire.get_profile_type( profile.type )
                                                .then( function( response ) {
                                                    profile.profile = response.data;
                                                } );
                                        } );

                                        ctrl.current_profile = ctrl.user.active_profile();
                                    };
                                } ],
                  template: `
<select ng:disabled="$ctrl.user.profiles.length <= 1"
        ng:model="$ctrl.current_profile"
        ng:change="$ctrl.apply_change()"
        ng:options="profile as profile.structure.name + ' : ' + profile.profile.name group by profile.structure.name for profile in $ctrl.user.profiles track by profile.id" >
</select>
`
                } );
