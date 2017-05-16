'use strict';

angular.module( 'portailApp' )
    .factory( 'User',
              [ '$resource', '$rootScope', 'URL_ENT',
                function( $resource, $rootScope, URL_ENT ) {
                    var User = $resource( URL_ENT + '/api/users/:id',
                                          { id: '@id',
                                            firstname: '@firstname',
                                            lastname: '@lastname',
                                            gender: '@gender',
                                            birthdate: '@birthdate',
                                            address: '@address',
                                            zip_code: '@zip_code',
                                            city: '@city',
                                            password: '@password',
                                            // login: '@login',
                                            // bloque: '@bloque'
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
                            || ( !_.chain(this.profiles).findWhere({ structure_id: this.active_profile().structure_id, type: 'ADM' }).isUndefined().value() );
                    };

                    return User;
                } ] );

angular.module( 'portailApp' )
    .service( 'currentUser',
              [ '$rootScope', '$http', '$resource', '$q', 'URL_ENT', 'User', 'Apps',
                function( $rootScope, $http, $resource, $q, URL_ENT, User, Apps ) {
                    var service = this;

                    service.get = _.memoize( function( force_reload ) {
                        return $http.get( URL_ENT + '/api/users/current' );
                    } );

                    service.activate_profile = function( profile_id ) {
                        return service.get().then( function success( response ) {
                            var user = new User( response.data );

                            return $http({ method: 'PUT',
                                           url: URL_ENT + '/api/users/' + user.id + '/profiles/' + profile_id,
                                           data: { active: true } } );

                            // .then( function success( response ) {
                            //     user = new User( response );
                            // },
                            //        function error( response ) {} );
                        } );
                    };

                    service.ressources = function() {
                        return service.get().then( function success( response ) {
                            var user = new User( response.data );

                            return $http.get( URL_ENT + '/api/users/' + user.id + '/ressources' )
                                .then( function( response ) {
                                    return _.chain(angular.fromJson( response.data ))
                                        .select( function( rn ) {
                                            var now = moment();
                                            return rn.structure_id === $rootScope.current_user.active_profile().structure_id
                                                && ( moment( rn.date_deb_abon).isBefore( now ) ) && ( moment( rn.date_fin_abon).isAfter( now ) );
                                        } )
                                        .map( function( rn ) {
                                            return { nom: rn.lib,
                                                     description: rn.nom_court,
                                                     url: rn.url_access_get,
                                                     icon: rn.type_ressource === 'MANUEL' ? '05_validationcompetences.svg' : ( rn.type_ressource === 'AUTRE' ? '07_blogs.svg' : '08_ressources.svg' ) };
                                        } )
                                        .value();
                                } );

                        } );
                    };

                    service.apps = function() {
                        return service.get().then( function success( response ) {
                            var user = new User( response.data );

                            if ( _(user.profiles).isEmpty() ) {
                                return Apps.query_defaults().$promise.then( function( tiles ) {
                                    return $q.resolve( _(tiles).where( { application_id: 'MAIL' } ) );
                                } );
                            } else {
                                return Apps.query( { uai: user.active_profile().structure_id } ).$promise;
                            }
                        } );
                    };

                    // service.regroupements = function() {
                    //     return user.then( function( user ) {
                    //         console.log($http)
                    //         console.log(user)
                    //         $q.all( user.groups.map( function( group ) { return $http({ method: 'GET',
                    //                                                                     url: URL_ENT + '/api/groups/' + group.group_id }); } ) )
                    //             .then( function( response ) {
                    //                 console.log(response)
                    //             } )
                    //     } );
                    // };
                    // service.eleves_regroupement = function( id ) {
                    //     return $http.get( URL_ENT + '/api/app/regroupements/' + id )
                    //         .then( function( response ) {
                    //             return _(response.data.eleves)
                    //                 .map( function( eleve ) {
                    //                     eleve.avatar = URL_ENT + '/api/avatar/' + eleve.avatar;
                    //                 } );
                    //         } );
                    // };
                } ] );
