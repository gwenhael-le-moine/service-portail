'use strict';

angular.module( 'portailApp' )
    .factory( 'User',
              [ '$resource', 'URL_ENT',
                function( $resource, URL_ENT ) {
                    var User = $resource( URL_ENT + '/api/users/:id',
                                          { id: '@id',
                                            firstname: '@firstname',
                                            lastname: '@lastname',
                                            gender: '@gender',
                                            birthdate: '@birthdate',
                                            address: '@address',
                                            zip_code: '@zip_code',
                                            city: '@city',
                                            password: '@password'
                                          },
                                          { get: { cache: false },
                                            update: { method: 'PUT' },
                                            // delete_avatar: { method: 'DELETE',
                                            //                  url: URL_ENT + '/api/users/' + UID + '/avatar' },
                                            upload_avatar: { method: 'POST',
                                                             url: URL_ENT + '/api/users/:id/upload/avatar',
                                                             transformRequest: function( request ) {
                                                                 var fd = new FormData();
                                                                 fd.append( 'image', request.new_avatar.blob, 'new_avatar.png' );
                                                                 fd.append( 'fileFormDataName', 'image' );

                                                                 delete request.new_avatar;

                                                                 return fd;
                                                             },
                                                             headers: { 'Content-Type': undefined } }
                                          } );
                    User.prototype.active_profile = function() {
                        return _(this.profiles).findWhere({ active: true });
                    };

                    User.prototype.is_admin = function() {
                        return ( _(this).has('super_admin') && this.super_admin )
                            || ( !_(this.profiles).isEmpty() && ( !_.chain(this.profiles).findWhere({ structure_id: this.active_profile().structure_id, type: 'DIR' }).isUndefined().value()
                                                                  || !_.chain(this.profiles).findWhere({ structure_id: this.active_profile().structure_id, type: 'ADM' }).isUndefined().value() ) );
                    };

                    return User;
                } ] );
