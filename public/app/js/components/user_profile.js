'use strict';

angular.module( 'portailApp' )
    .component( 'userprofile',
                { bindings: { user: '=' },
                  templateUrl: 'app/js/components/user_profile.html',
                  controller: [ '$rootScope', 'toastr', 'currentUser', 'APP_PATH', 'Utils', 'User',
                                function( $rootScope, toastr, currentUser, APP_PATH, Utils, User ) {
                                    var ctrl = this;
                                    ctrl.dirty = {};

                                    ctrl.prefix = APP_PATH;
                                    ctrl.groups = [ { ouvert: true,
                                                      enabled: true },
                                                    { ouvert: true,
                                                      enabled: true } ];

                                    ctrl.password = { new1: '',
                                                      new2: '' };

                                    ctrl.open_datepicker = function( $event ) {
                                        $event.preventDefault();
                                        $event.stopPropagation();
                                    };

                                    ctrl.mark_as_dirty = function( key ) {
                                        ctrl.dirty[ key ] = true;
                                    };

                                    ctrl.filter_emails = function() {
                                        return function( email ) {
                                            return ( ctrl.user.active_profile().type !== 'TUT' || email.type !== 'Ent' ) && _(email.asdress.match( email.user_id )).isNull();
                                        };
                                    };

                                    ctrl.fermer = function( sauvegarder ) {
                                        if ( sauvegarder
                                             && !_(ctrl.dirty).isEmpty()
                                             && ( _(ctrl.password.new1).isEmpty()
                                                  || ( !_(ctrl.password.new1).isEmpty()
                                                       && ( ctrl.password.new1 === ctrl.password.new2 ) ) ) ) {
                                            var mod_user = {};

                                            _(ctrl.dirty).keys().forEach( function( key ) {
                                                mod_user[ key ] = ctrl.user[ key ];
                                            } );

                                            if ( !_(ctrl.password.new1).isEmpty() ) {
                                                mod_user.password = ctrl.password.new1;
                                            }

                                            User.update( { id: ctrl.user.id }, mod_user ).$promise
                                                .then( function success( response ) {
                                                    $rootScope.current_user = new User( response );
                                                    toastr.success( 'Mise à jour effectuée.' );
                                                },
                                                       function error( response ) {} );
                                        }
                                    };

                                    ctrl.$onInit = function() {
                                        ctrl.user.editable = _(ctrl.user.aaf_jointure_id).isNull();

                                        ctrl.user.birthdate = new Date( ctrl.user.birthdate );
                                    };
                                } ]
                } );
