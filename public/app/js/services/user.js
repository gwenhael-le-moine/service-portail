'use strict';

angular.module( 'portailApp' )
    .factory( 'User',
              [ '$resource', '$rootScope', 'URL_ENT', 'UID',
                function( $resource, $rootScope, URL_ENT, UID ) {
                    var User = $resource( URL_ENT + '/api/users/' + UID,
                                          {  },
                                          { get: { cache: false },
                                            update: { method: 'PUT',
                                                      params: { firstname: '@firstname',
                                                                lastname: '@lastname',
                                                                gender: '@gender',
                                                                birthdate: '@birthdate',
                                                                address: '@address',
                                                            zip_code: '@zip_code',
                                                            city: '@city',
                                                            password: '@password',
                                                            // login: '@login',
                                                            // bloque: '@bloque'
                                                          } },
                                        activate_profile: { method: 'PUT',
                                                            url: URL_ENT + '/api/users/' + UID + '/profil_actif',
                                                            params: { profil_id: '@profil_id',
                                                                      active: true } },
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
                    User.prototype.active_profile = function() {
                        return _(this.profiles).findWhere({ active: true });
                    };

                    User.prototype.is_admin = function() {
                        return ( _(this).has('super_admin') && this.super_admin )
                            || ( !_.chain(this.profiles).findWhere({ structure_id: user.active_profile().structure_id, type: 'ADM' }).isUndefined().value() );
                    };

                    return User;
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
                    };
                    this.apps = function() {
                        return user.then( function( u ) {
                            if ( _(u.profiles).isEmpty() || _(u.active_profile()).isUndefined() ) {
                                return Apps.query_defaults().$promise.then( function( tiles ) {
                                    return $q.resolve( _(tiles).where( { application_id: 'MAIL' } ) );
                                } );
                            } else {
                                return Apps.query( { uai: u.active_profile().structure_id } ).$promise;
                            }
                        } );
                    };
                    this.regroupements = function() {
                        return user.then( function( user ) {
                            return _.chain(user.classes)
                                .concat(user.groupes_eleves)
                                .select( function( regroupement ) {
                                    return _(regroupement).has('structure_id') && regroupement.structure_id === user.active_profile().structure_id;
                                } )
                                .map( function( regroupement ) {
                                    return { type: _(regroupement).has('classe_id') ? 'classe' : 'groupe_eleve',
                                             id: _(regroupement).has('classe_id') ? regroupement.classe_id : regroupement.groupe_id,
                                             libelle: _(regroupement).has('classe_id') ? regroupement.classe_libelle : regroupement.groupe_libelle,
                                             // FIXME
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
