'use strict';

angular.module( 'portailApp' )
    .component( 'userprofile',
                { bindings: { user: '=' },
                  templateUrl: 'views/component_user_profile.html',
                  controller: [ '$rootScope', 'currentUser', 'APP_PATH', 'Utils', 'User',
                                function( $rootScope, currentUser, APP_PATH, Utils, User ) {
                                    var ctrl = this;
                                    var dirty = {};

                                    ctrl.prefix = APP_PATH;
                                    ctrl.groups = [ { ouvert: true,
                                                      enabled: true },
                                                    { ouvert: true,
                                                      enabled: true } ];

                                    ctrl.open_datepicker = function( $event ) {
                                        $event.preventDefault();
                                        $event.stopPropagation();

                                        ctrl.opened = true;
                                    };

                                    ctrl.password = { new1: '',
                                                      new2: '' };

                                    ctrl.mark_as_dirty = function( key ) {
                                        dirty[ key ] = true;
                                    };

                                    ctrl.filter_emails = function() {
                                        return function( email ) {
                                            return ( ctrl.user.profil_actif.profil_id !== 'TUT' || email.type !== 'Ent' ) && _(email.adresse.match( email.user_id )).isNull();
                                        };
                                    };

                                    ctrl.fermer = function( sauvegarder ) {
                                        if ( sauvegarder && !_(dirty).isEmpty() ) {
                                            if ( _(ctrl.password.new1).isEmpty() || ( !_(ctrl.password.new1).isEmpty() && ( ctrl.password.new1 == ctrl.password.new2 ) ) ) {
                                                var mod_user = {};

                                                _(dirty).keys().forEach( function( key ) {
                                                    mod_user[ key ] = ctrl.user[ key ];
                                                } );

                                                if ( !_(ctrl.password.new1).isEmpty() ) {
                                                    mod_user.password = ctrl.password.new1;
                                                }

                                                User.update( mod_user );
                                            }
                                        }
                                    };

                                    ctrl.user.editable = _(ctrl.user.id_jointure_aaf).isNull();

                                    ctrl.user.date_naissance = new Date( ctrl.user.date_naissance );
                                } ]
                } );
