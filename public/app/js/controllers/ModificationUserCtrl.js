'use strict';

angular.module( 'portailApp' )
    .controller( 'ModificationUserCtrl',
                 [ '$scope', '$rootScope', '$state', 'toastr', 'current_user', 'currentUser', 'apps', 'APP_PATH',
                   function( $scope, $rootScope, $state, toastr, current_user, currentUser, apps, APP_PATH ) {
                       var dirty = false;

                       $scope.prefix = APP_PATH;
                       $scope.groups = [ { ouvert: true,
                                           enabled: true },
                                         { ouvert: true,
                                           enabled: true },
                                         { ouvert: false,
                                           enabled: false },
                                         { ouvert: false,
                                           enabled: false } ];

                       $scope.open_datepicker = function( $event ) {
                           $event.preventDefault();
                           $event.stopPropagation();

                           $scope.opened = true;
                       };

                       $scope.password = { old: '',
                                           new1: '',
                                           new2: '',
                                           changeable: false };

                       $scope.mark_as_dirty = function() {
                           dirty = true;
                       };

                       apps.query( false )
                           .then( function( response ) {
                               $scope.password.changeable = _.chain(response).find({application_id: 'TELESRV'}).isUndefined().value();
                           } );
                       $scope.uploaded_avatar = null;

                       $rootScope.current_user.hide_email = $rootScope.current_user.profil_actif.profil_id === 'TUT' && !_( $rootScope.current_user.info.MailAdressePrincipal.match( /laclasse.com$/ ) ).isNull();
                       $scope.apply_reset_avatar = false;

                       // FIXME: modification disabled due to bug #163
                       // $rootScope.current_user.editable = _($rootScope.current_user.id_jointure_aaf).isNull();
                       $rootScope.current_user.editable = false;

                       $rootScope.current_user.date_naissance = new Date( $rootScope.current_user.date_naissance );
                       $scope.progress_percentage = 0;

                       var blobToDataURL = function( blob, callback ) {
                           var a = new FileReader();
                           a.onload = function( e ) { callback( e.target.result ); };
                           a.readAsDataURL(blob);
                       };

                       $scope.getFile = function( file ) {
                           var max_height = 256;
                           var max_width = 256;

                           $scope.avatar = { image: null,
                                             width: 0,
                                             height: 0 };

                           blobToDataURL( file,
                                          function( dataURL ) {
                                              $scope.avatar.image = dataURL;
                                              $scope.apply_reset_avatar = false;
                                              $rootScope.current_user.new_avatar = file;
                                              $scope.uploaded_avatar = file;
                                              $scope.mark_as_dirty();

                                              var img = new Image();

                                              img.onload = function() {
                                                  $scope.avatar.height = img.height;
                                                  $scope.avatar.width = img.width;

                                                  // Compute new dimensions if necessary
                                                  var factor = 1;

                                                  if ( $scope.avatar.width > max_width ) {
                                                      factor = max_width / img.width;
                                                      $scope.avatar.width = max_width;
                                                      $scope.avatar.height = img.height * factor;
                                                  }

                                                  if ( $scope.avatar.height > max_height ) {
                                                      factor = max_height / img.height;
                                                      $scope.avatar.height = max_height;
                                                      $scope.avatar.width = img.width * factor;
                                                  }

                                                  // create new, resized image blob using canvas
                                                  var canvas = document.createElement( 'canvas' );
                                                  canvas.width = $scope.avatar.width;
                                                  canvas.height = $scope.avatar.height;

                                                  var ctx = canvas.getContext( '2d' );
                                                  ctx.drawImage( img, 0, 0, $scope.avatar.width, $scope.avatar.height );

                                                  canvas.toBlob( function( blob ) {
                                                      blob.name = file.name;
                                                      $rootScope.current_user.new_avatar = blob;
                                                      $scope.uploaded_avatar = blob;
                                                  },
                                                                 'image/png' );

                                                  $scope.avatar.image = canvas.toDataURL();
                                              };
                                              img.src = $scope.avatar.image;
                                          } );
                       };

                       $scope.reset_avatar = function() {
                           $scope.apply_reset_avatar = true;
                       };

                       $scope.check_password = function( password ) {
                           currentUser.check_password( password ).then( function( response ) {
                               return response.valid;
                           } );
                       };

                       $scope.upload_avatar = function() {
                           $scope.operation_on_avatar = true;
                           toastr.info( 'Mise à jour de l\'avatar.');

                           currentUser.avatar.upload( $scope.uploaded_avatar )
                               .then( function( data, status, headers, config ) {
                                   $scope.operation_on_avatar = false;
                                   $scope.uploaded_avatar = null;
                                   currentUser.force_refresh();
                               });
                       };

                       $scope.delete_avatar = function() {
                           $scope.operation_on_avatar = true;
                           toastr.info( 'Suppression de l\'avatar.');

                           currentUser.avatar.delete()
                               .then( function( response ) {
                                   $scope.operation_on_avatar = false;
                                   $scope.uploaded_avatar = null;
                                   currentUser.force_refresh();
                               } );
                       };

                       $scope.fermer = function( sauvegarder ) {
                           if ( sauvegarder && dirty ) {
                               var password_confirmed = true;
                               if ( !_($scope.password.old).isEmpty() && !_($scope.password.new1).isEmpty() ) {
                                   if ( $scope.password.new1 == $scope.password.new2 ) {
                                       $rootScope.current_user.previous_password = $scope.password.old;
                                       $rootScope.current_user.new_password = $scope.password.new1;
                                   } else {
                                       password_confirmed = false;
                                       toastr.error( 'Confirmation de mot de passe incorrecte.',
                                                     'Erreur',
                                                     { timeout: 100000 } );
                                   }
                               }

                               if ( password_confirmed ) {
                                   toastr.info( 'Mise à jour du profil.');
                                   $rootScope.current_user.$update().then( function() {
                                       currentUser.force_refresh();

                                       if ( !_($scope.uploaded_avatar).isNull() &&
                                            $scope.uploaded_avatar.type != "" &&
                                            !_($scope.uploaded_avatar.type.match( "image/.*" )).isNull() ) {
                                           $scope.upload_avatar();
                                       } else if ( $scope.apply_reset_avatar ) {
                                           $scope.delete_avatar();
                                       } else {
                                           currentUser.force_refresh();
                                           $state.go( 'portail.logged', {}, { reload: true } );
                                       }
                                   } );
                               }
                           } else {
                               $state.go( 'portail.logged' );
                           }
                       };
                   } ] );
