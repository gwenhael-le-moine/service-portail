'use strict';

angular.module( 'portailApp' )
    .factory( 'User',
              [ '$resource', '$rootScope', 'URL_ENT', 'UID',
                function( $resource, $rootScope, URL_ENT, UID ) {
                    return $resource( URL_ENT + '/api/app/users/' + UID,
                                      { expand: 'true' },
                                      { get: { transformResponse: function( response ) {
                                          var user = angular.fromJson( response );

                                          user.profils.forEach( function( profil, index ) {
                                              profil.index = index;
                                          } );
                                          user.profil_actif = _(user.profils).findWhere({ actif: true });

                                          user.is_admin = function() {
                                              return _(user).has('profil_actif')
                                                  && ( !_.chain(user.roles)
                                                       .findWhere({ role_id: 'ADM_ETB',
                                                                    etablissement_code_uai: user.profil_actif.etablissement_code_uai })
                                                       .isUndefined()
                                                       .value()
                                                       || !_.chain(user.roles)
                                                       .findWhere({ role_id: 'TECH' })
                                                       .isUndefined()
                                                       .value() );
                                          };

                                          return user;
                                      } },
                                        update: { method: 'PUT',
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
                                                               url: URL_ENT + '/api/app/users/' + UID + '/profil_actif',
                                                               params: { profil_id: '@profil_id',
                                                                         uai: '@uai'} }
                                      } );
                } ] );

angular.module( 'portailApp' )
    .service( 'currentUser',
              [ '$rootScope', '$http', '$resource', '$q', 'UID', 'URL_ENT', 'User', 'Apps',
                function( $rootScope, $http, $resource, $q, UID, URL_ENT, User, Apps ) {
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

                    this.ressources = function() {
                        return $http.get( URL_ENT + '/api/app/users/' + UID + '/ressources' )
                            .then( function( response ) {
                                return _.chain(angular.fromJson( response.data ))
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
                            } );
                    };
                    this.apps = function() {
                        return user.then( function( u ) {
                            if ( !_(u).has('profils') || !_(u).has('profil_actif') ) {
                                return Apps.query_defaults().$promise.then( function( tiles ) {
                                    return $q.resolve( _(tiles).where( { application_id: 'MAIL' } ) );
                                } );
                            } else {
                                return Apps.query( { uai: u.profil_actif.etablissement_code_uai } ).$promise;
                            }
                        } );
                    };
                    this.regroupements = function() {
                        return $http.get( URL_ENT + '/api/app/users/' + UID + '/regroupements' )
                            .then( function( response ) {
                                return user.then( function( user ) {
                                    return _.chain(response.data.classes)
                                        .concat(response.data.groupes_eleves)
                                        .select( function( regroupement ) {
                                            return _(regroupement).has('etablissement_code') && regroupement.etablissement_code == user.profil_actif.etablissement_code_uai;
                                        } )
                                        .map( function( regroupement ) {
                                            return { type: _(regroupement).has('classe_id') ? 'classe' : 'groupe_eleve',
                                                     id: _(regroupement).has('classe_id') ? regroupement.classe_id : regroupement.groupe_id,
                                                     libelle: _(regroupement).has('classe_id') ? regroupement.classe_libelle : regroupement.groupe_libelle,
                                                     etablissement_nom: regroupement.etablissement_nom };
                                        } )
                                        .uniq()
                                        .sortBy( function( regroupement ) {
                                            return regroupement.type;
                                        } )
                                        .value();
                                } );
                            } );
                    };
                    this.eleves_regroupement = function( id ) {
                        return $http.get( URL_ENT + '/api/app/regroupements/' + id )
                            .then( function( response ) {
                                return _(response.data.eleves)
                                    .map( function( eleve ) {
                                        eleve.avatar = URL_ENT + '/api/avatar/' + eleve.avatar;
                                    } );
                            } );
                    };

                    this.avatar = { upload: function( file ) {
                        var formdata = new FormData();
                        formdata.append( 'image', file );
                        formdata.append( 'fileFormDataName', 'image' );

                        return $http.post( URL_ENT + '/api/app/users/' + UID + '/upload/avatar',
                                           formdata,
                                           { transformRequest: angular.identity,
                                             headers: { 'Content-Type': undefined } } );
                    },
                                    delete: function() {
                                        return $http.delete( URL_ENT + '/api/app/users/' + UID + '/avatar' );
                                    }
                                  };
                } ] );
