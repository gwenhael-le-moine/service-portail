'use strict';

angular.module( 'portailApp' )
    .factory( 'User',
              [ '$resource', '$rootScope', 'APP_PATH', 'URL_ENT', 'UID',
                function( $resource, $rootScope, APP_PATH, URL_ENT, UID ) {
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
                                                               params: { profil_id: '@profil_id' } },
                                        ressources_numeriques: { method: 'GET',
                                                                 url: URL_ENT + '/api/app/users/' + UID + '/ressources',
                                                                 isArray: true,
                                                                 transformResponse: function( response, _headers_getters ) {
                                                                     return _.chain(angular.fromJson( response ))
                                                                         .select( function( rn ) {
                                                                             var now = moment();
                                                                             return rn.etablissement_code_uai === $rootScope.current_user.profil_actif.etablissement_code_uai
                                                                                 && ( moment( rn.date_deb_abon).isBefore( now ) ) && ( moment( rn.date_fin_abon).isAfter( now ) );
                                                                         } )
                                                                         .map( function( rn ) {
                                                                             return { nom: rn.lib,
                                                                                      description: rn.nom_court,
                                                                                      url: rn.url_access_get,
                                                                                      icon: rn.type_ressource === 'MANUEL' ? '05_validationcompetences.svg' : ( rn.type_ressource === 'AUTRE' ? '07_blogs.svg' : '08_ressources.svg' ) };
                                                                         } )
                                                                         .value();
                                                                 } }
                                      } );
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
              [ '$rootScope', '$http', '$resource', '$q', 'APP_PATH', 'URL_ENT', 'User', 'UserRegroupements', 'Apps',
                function( $rootScope, $http, $resource, $q, APP_PATH, URL_ENT, User, UserRegroupements, Apps ) {
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

                    this.ressources = function() { return User.ressources_numeriques().$promise; };
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
