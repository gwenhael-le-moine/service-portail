'use strict';

angular.module( 'portailApp' )
    .factory( 'User',
              [ '$resource', '$rootScope', 'URL_ENT', 'UID',
                function( $resource, $rootScope, URL_ENT, UID ) {
                    return $resource( URL_ENT + '/api/users/' + UID,
                                      { expand: 'true' },
                                      { get: { cache: false,
                                               transformResponse: function( response ) {
                                                   var user = angular.fromJson( response );

                                                   user.profil_actif = _(user.profils).findWhere({ actif: true });

                                                   user.is_admin = function() {
                                                       return !_(user.profil_actif).isUndefined()
                                                           && ( !_.chain(user.roles)
                                                                .findWhere({ role_id: 'ADM_ETB', etablissement_id: user.profil_actif.etablissement_id })
                                                                .isUndefined()
                                                                .value()
                                                                || !_.chain(user.roles)
                                                                .findWhere({ role_id: 'TECH' })
                                                                .isUndefined()
                                                                .value() );
                                                   };

                                                   return user;
                                               }
                                             },
                                        update: { method: 'PUT',
                                                  params: { nom: '@nom',
                                                            prenom: '@prenom',
                                                            sexe: '@sexe',
                                                            date_naissance: '@date_naissance',
                                                            adresse: '@adresse',
                                                            code_postal: '@code_postal',
                                                            ville: '@ville',
                                                            password: '@password',
                                                            // login: '@login',
                                                            // bloque: '@bloque'
                                                          } },
                                        change_profil_actif: { method: 'PUT',
                                                               url: URL_ENT + '/api/users/' + UID + '/profil_actif',
                                                               params: { profil_id: '@profil_id',
                                                                         uai: '@uai' } },
                                        delete_avatar: { method: 'DELETE',
                                                         url: URL_ENT + '/api/users/' + UID + '/avatar' },
                                        upload_avatar: { method: 'POST',
                                                         url: URL_ENT + '/api/users/' + UID + '/upload/avatar',
                                                         transformRequest: function( request ) {
                                                             var fd = new FormData();
                                                             fd.append( 'image', request.new_avatar.blob, UID + '.png' );
                                                             fd.append( 'fileFormDataName', 'image' );

                                                             delete request.new_avatar;

                                                             return fd;
                                                         },
                                                         headers: { 'Content-Type': undefined } }
                                      } );
                } ] );

angular.module( 'portailApp' )
    .service( 'currentUser',
              [ '$rootScope', '$http', '$resource', '$q', 'UID', 'URL_ENT', 'User', 'Apps',
                function( $rootScope, $http, $resource, $q, UID, URL_ENT, User, Apps ) {
                    var user = null;
                    var service = this;

                    this.force_refresh = function( force_reload ) {
                        user = User.get( { force_refresh: force_reload } ).$promise;
                        user.then( function( response ) {
                            $rootScope.current_user = response;
                        } );
                    };
                    this.get = function( force_reload ) {
                        if ( _(user).isNull() || force_reload ) {
                            service.force_refresh( force_reload );
                        }
                        return user;
                    };

                    this.ressources = function() {
                        return $http.get( URL_ENT + '/api/users/' + UID + '/ressources' )
                            .then( function( response ) {
                                return _.chain(angular.fromJson( response.data ))
                                    .select( function( rn ) {
                                        var now = moment();
                                        return rn.etablissement_id === $rootScope.current_user.profil_actif.etablissement_id
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
                            if ( _(u.profils).isEmpty() || _(u.profil_actif).isUndefined() ) {
                                return Apps.query_defaults().$promise.then( function( tiles ) {
                                    return $q.resolve( _(tiles).where( { application_id: 'MAIL' } ) );
                                } );
                            } else {
                                return Apps.query( { uai: u.profil_actif.etablissement_id } ).$promise;
                            }
                        } );
                    };
                    this.regroupements = function() {
                        return user.then( function( user ) {
                            return _.chain(user.classes)
                                .concat(user.groupes_eleves)
                                .select( function( regroupement ) {
                                    return _(regroupement).has('etablissement_code') && regroupement.etablissement_code === user.profil_actif.etablissement_id;
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
                } ] );
