'use strict';

angular.module( 'portailApp' )
    .directive( 'fileChanged',
                function() {
                    return { restrict: 'A',
                             link: function( scope, element, attrs ) {
                                 element.bind('change', scope.$eval( attrs.fileChanged ) );
                             } };
                } )
    .component( 'avatar',
                { bindings: { user: '=' },
                  template: '<div class="avatar">' +
                  '              <img draggable="false" class="svg" ' +
                  '               ng:src="{{$ctrl.user.new_avatar.image ? $ctrl.user.new_avatar.image : $ctrl.user.avatar}}" />' +
                  '          <input type="file" file-changed="$ctrl.onChange"/>' +
                  '          <footer>' +
                  '              <button ng:disabled="!$ctrl.user.new_avatar.blob"' +
                  '                      ng:click="$ctrl.upload_avatar()">Valider l\'avatar</button>' +
                  '          </footer>' +
                  '</div>',
                  controller: [ 'currentUser',
                                function( currentUser ) {
                                    var ctrl = this;

                                    var processFile = function( file ) {
                                        var max_height = 256;
                                        var max_width = 256;

                                        var blobToDataURL = function( blob, callback ) {
                                            var a = new FileReader();
                                            a.onload = function( e ) { callback( e.target.result ); };
                                            a.readAsDataURL( blob );
                                        };

                                        blobToDataURL( file,
                                                       function( dataURL ) {
                                                           ctrl.user.new_avatar.image = dataURL;

                                                           var img = new Image();

                                                           img.onload = function() {
                                                               ctrl.user.new_avatar.height = img.height;
                                                               ctrl.user.new_avatar.width = img.width;

                                                               // Compute new dimensions if necessary
                                                               var factor = 1;

                                                               if ( ctrl.user.new_avatar.width > max_width ) {
                                                                   factor = max_width / img.width;
                                                                   ctrl.user.new_avatar.width = max_width;
                                                                   ctrl.user.new_avatar.height = img.height * factor;
                                                               }

                                                               if ( ctrl.user.new_avatar.height > max_height ) {
                                                                   factor = max_height / img.height;
                                                                   ctrl.user.new_avatar.height = max_height;
                                                                   ctrl.user.new_avatar.width = img.width * factor;
                                                               }

                                                               // create new, resized image blob using canvas
                                                               var canvas = document.createElement( 'canvas' );
                                                               canvas.width = ctrl.user.new_avatar.width;
                                                               canvas.height = ctrl.user.new_avatar.height;

                                                               var ctx = canvas.getContext( '2d' );
                                                               ctx.drawImage( img, 0, 0, ctrl.user.new_avatar.width, ctrl.user.new_avatar.height );

                                                               canvas.toBlob( function( blob ) {
                                                                   blob.name = file.name;
                                                                   ctrl.user.new_avatar.blob = blob;
                                                               },
                                                                              'image/png' );

                                                               ctrl.user.new_avatar.image = canvas.toDataURL();
                                                           };

                                                           img.src = ctrl.user.new_avatar.image;
                                                       } );
                                    };

                                    ctrl.onChange = function( event ) {
                                        processFile( event.target.files[0] );
                                    };

                                    var reset_new_avatar = function() {
                                        ctrl.user.new_avatar = { image: null,
                                                                 blob: null,
                                                                 width: 0,
                                                                 height: 0 };
                                    };

                                    ctrl.upload_avatar = function() {
                                        currentUser.avatar.upload( ctrl.user.new_avatar.blob )
                                            .then( function( data, status, headers, config ) {
                                                currentUser.force_refresh();
                                                reset_new_avatar();
                                            });
                                    };

                                    reset_new_avatar();
                                } ]
                } );
