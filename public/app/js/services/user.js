'use strict';

angular.module( 'portailApp' )
    .factory( 'User',
              [ '$resource', 'APP_PATH', 'URL_ENT',
                function( $resource, APP_PATH, URL_ENT ) {
                    return $resource( APP_PATH + '/api/user',
                                      { force_refresh: '@force_refresh' },
                                      { update: { method: 'PUT',
                                                  params: { nom: '@nom',
                                                            prenom: '@prenom',
                                                            sexe: '@sexe',
                                                            date_naissance: '@date_naissance',
                                                            adresse: '@adresse',
                                                            code_postal: '@code_postal',
                                                            ville: '@ville',
                                                            // login: '@login',
                                                            password: '@password',
                                                            // bloque: '@bloque'
                                                          } },
                                        change_profil_actif: { method: 'PUT',
                                                               url: APP_PATH + '/api/user/profil_actif/:index',
                                                               params: { profil_id: '@profil_id' } }
                                      } );
                } ] );

angular.module( 'portailApp' )
    .factory( 'UserRessources',
              [ '$resource', 'APP_PATH',
                function( $resource, APP_PATH ) {
                    return $resource( APP_PATH + '/api/user/ressources_numeriques' );
                } ] );

angular.module( 'portailApp' )
    .factory( 'UserRegroupements',
              [ '$resource', 'APP_PATH',
                function( $resource, APP_PATH ) {
                    return $resource( APP_PATH + '/api/user/regroupements/:id',
                                      { id: '@id' },
                                      { eleves: { method: 'GET',
                                                  url: APP_PATH + '/api/user/regroupements/:id/eleves',
                                                  isArray: true } } );
                } ] );

angular.module( 'portailApp' )
    .service( 'currentUser',
              [ '$rootScope', '$http', '$resource', '$q', 'APP_PATH', 'URL_ENT', 'User', 'UserRessources', 'UserRegroupements', 'Apps',
                function( $rootScope, $http, $resource, $q, APP_PATH, URL_ENT, User, UserRessources, UserRegroupements, Apps ) {
                    var user = null;

                    this.force_refresh = function( force_reload ) {
                        user = User.get( { force_refresh: force_reload } ).$promise;
                        user.then( function( response ) {
                            $rootScope.current_user = response;
                        } );
                    };
                    this.get = function( force_reload ) {
                        if ( _(user).isNull() || force_reload ) {
                            this.force_refresh( force_reload );
                        }
                        return user;
                    };

                    this.ressources = function() { return UserRessources.query().$promise; };
                    this.apps = function() {
                        return user.then( function( u ) {
                            if ( !u.has_profil || !_(u).has('profil_actif') ) {
                                return Apps.query_defaults().$promise.then( function( tiles ) {
                                    return $q.resolve( _(tiles).where( { application_id: 'MAIL' } ) );
                                } );
                            } else {
                                return Apps.query( { uai: u.profil_actif.etablissement_code_uai } ).$promise;
                            }
                        } );
                    };
                    this.regroupements = function() { return UserRegroupements.query().$promise; };
                    this.eleves_regroupement = function( id ) { return UserRegroupements.eleves( { id: id } ).$promise; };

                    this.avatar = { upload: function( file ) {
                        var formdata = new FormData();
                        formdata.append( 'image', file );
                        formdata.append( 'fileFormDataName', 'image' );

                        return $http.post( APP_PATH + '/api/user/avatar',
                                           formdata,
                                           { transformRequest: angular.identity,
                                             headers: { 'Content-Type': undefined } } );
                    },
                                    delete: function() {
                                        return $http.delete( APP_PATH + '/api/user/avatar' );
                                    }
                                  };
                } ] );
