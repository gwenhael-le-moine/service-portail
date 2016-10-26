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

                                    ctrl.uploaded_avatar = null;
                                    ctrl.apply_reset_avatar = false;

                                    ctrl.user.editable = _(ctrl.user.id_jointure_aaf).isNull();

                                    ctrl.user.date_naissance = new Date( ctrl.user.date_naissance );
                                    ctrl.progress_percentage = 0;

                                    var blobToDataURL = function( blob, callback ) {
                                        var a = new FileReader();
                                        a.onload = function( e ) { callback( e.target.result ); };
                                        a.readAsDataURL(blob);
                                    };

                                    ctrl.getFile = function( file ) {
                                        var max_height = 256;
                                        var max_width = 256;

                                        ctrl.avatar = { image: null,
                                                        width: 0,
                                                        height: 0 };

                                        blobToDataURL( file,
                                                       function( dataURL ) {
                                                           ctrl.avatar.image = dataURL;
                                                           ctrl.apply_reset_avatar = false;
                                                           ctrl.user.new_avatar = file;
                                                           ctrl.uploaded_avatar = file;
                                                           ctrl.mark_as_dirty( 'avatar' );

                                                           var img = new Image();

                                                           img.onload = function() {
                                                               ctrl.avatar.height = img.height;
                                                               ctrl.avatar.width = img.width;

                                                               // Compute new dimensions if necessary
                                                               var factor = 1;

                                                               if ( ctrl.avatar.width > max_width ) {
                                                                   factor = max_width / img.width;
                                                                   ctrl.avatar.width = max_width;
                                                                   ctrl.avatar.height = img.height * factor;
                                                               }

                                                               if ( ctrl.avatar.height > max_height ) {
                                                                   factor = max_height / img.height;
                                                                   ctrl.avatar.height = max_height;
                                                                   ctrl.avatar.width = img.width * factor;
                                                               }

                                                               // create new, resized image blob using canvas
                                                               var canvas = document.createElement( 'canvas' );
                                                               canvas.width = ctrl.avatar.width;
                                                               canvas.height = ctrl.avatar.height;

                                                               var ctx = canvas.getContext( '2d' );
                                                               ctx.drawImage( img, 0, 0, ctrl.avatar.width, ctrl.avatar.height );

                                                               canvas.toBlob( function( blob ) {
                                                                   blob.name = file.name;
                                                                   ctrl.user.new_avatar = blob;
                                                                   ctrl.uploaded_avatar = blob;
                                                               },
                                                                              'image/png' );

                                                               ctrl.avatar.image = canvas.toDataURL();
                                                           };
                                                           img.src = ctrl.avatar.image;
                                                       } );
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
                                        ctrl.operation_on_avatar = true;

                                        currentUser.avatar.upload( ctrl.uploaded_avatar )
                                            .then( function( data, status, headers, config ) {
                                                ctrl.operation_on_avatar = false;
                                                ctrl.uploaded_avatar = null;
                                                currentUser.force_refresh();
                                                delete ctrl.avatar;
                                            });
                                    };

                                    ctrl.delete_avatar = function() {
                                        ctrl.operation_on_avatar = true;

                                        currentUser.avatar.delete()
                                            .then( function( response ) {
                                                ctrl.operation_on_avatar = false;
                                                ctrl.uploaded_avatar = null;
                                                currentUser.force_refresh();
                                            } );
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

                                                User.update( mod_user ).$promise
                                                    .then( function( response ) {
                                                        currentUser.force_refresh();

                                                        if ( !_(ctrl.uploaded_avatar).isNull() &&
                                                             ctrl.uploaded_avatar.type != "" &&
                                                             !_(ctrl.uploaded_avatar.type.match( "image/.*" )).isNull() ) {
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
                                } ]
                } );
