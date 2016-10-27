'use strict';

angular.module( 'portailApp' )
    .component( 'userprofile',
                { bindings: { user: '=' },
                  templateUrl: 'views/user_profile.html',
                  controller: [ '$rootScope', '$state', 'currentUser', 'APP_PATH', 'Utils', 'User',
                                function( $rootScope, $state, currentUser, APP_PATH, Utils, User ) {
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

                                    var reset_new_avatar = function() {
                                        ctrl.user.new_avatar = { image: null,
                                                                 blob: null,
                                                                 width: 0,
                                                                 height: 0 };
                                        delete dirty.new_avatar;
                                    };

                                    ctrl.reset_avatar = function() {
                                        ctrl.apply_reset_avatar = true;
                                    };

                                    ctrl.check_password = function( password ) {
                                        currentUser.check_password( password ).then( function( response ) {
                                            return response.valid;
                                        } );
                                    };

                                    ctrl.upload_avatar = function() {
                                        currentUser.avatar.upload( ctrl.user.new_avatar.blob )
                                            .then( function( data, status, headers, config ) {
                                                currentUser.force_refresh();
                                                reset_new_avatar();
                                            });
                                    };

                                    ctrl.delete_avatar = function() {
                                        ctrl.operation_on_avatar = true;

                                        currentUser.avatar.delete()
                                            .then( function( response ) {
                                                ctrl.operation_on_avatar = false;
                                                ctrl.uploaded_avatar = null;
                                                currentUser.force_refresh();
                                                reset_new_avatar();
                                            } );
                                    };

                                    ctrl.fermer = function( sauvegarder ) {
                                        if ( sauvegarder && ( !_(dirty).isEmpty() || !_(ctrl.user.new_avatar.blob).isNull() ) ) {
                                            if ( _(ctrl.password.new1).isEmpty() || ( !_(ctrl.password.new1).isEmpty() && ( ctrl.password.new1 == ctrl.password.new2 ) ) ) {
                                                var mod_user = {};

                                                _(dirty).keys().forEach( function( key ) {
                                                    mod_user[ key ] = ctrl.user[ key ];
                                                } );

                                                if ( !_(ctrl.password.new1).isEmpty() ) {
                                                    mod_user.password = ctrl.password.new1;
                                                }

                                                User.update( mod_user ).$promise
                                                    .then( function( response ) {
                                                        currentUser.force_refresh();

                                                        if ( !_(ctrl.user.new_avatar.blob).isNull() &&
                                                             ctrl.user.new_avatar.blob.type != "" &&
                                                             !_(ctrl.user.new_avatar.blob.type.match( "image/.*" )).isNull() ) {
                                                            ctrl.upload_avatar();
                                                        } else if ( ctrl.apply_reset_avatar ) {
                                                            ctrl.delete_avatar();
                                                        } else {
                                                            currentUser.force_refresh();
                                                            Utils.go_home();
                                                        }
                                                    } );
                                            }
                                        } else {
                                            Utils.go_home();
                                        }
                                    };

                                    ctrl.user.editable = _(ctrl.user.id_jointure_aaf).isNull();

                                    ctrl.user.date_naissance = new Date( ctrl.user.date_naissance );
                                    reset_new_avatar();
                                } ]
                } );
