'use strict';

angular.module( 'portailApp' )
    .service( 'currentUser',
              [ '$rootScope', '$http', '$resource', '$q', 'URL_ENT', 'User', 'Apps',
                function( $rootScope, $http, $resource, $q, URL_ENT, User, Apps ) {
                    var service = this;

                    service.get = _.memoize( function( force_reload ) {
                        return $http.get( URL_ENT + '/api/users/current' )
                            .then( function( response ) {
                                return new User( response.data );
                            } );
                    } );

                    service.activate_profile = function( profile_id ) {
                        return service.get().then( function success( user ) {
                            return $http({ method: 'PUT',
                                           url: URL_ENT + '/api/users/' + user.id + '/profiles/' + profile_id,
                                           data: { active: true } } );
                        } );
                    };

                    service.ressources = function() {
                        return service.get().then( function success( user ) {
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
                        return service.get().then( function success( user ) {
                            if ( _(user.profiles).isEmpty() ) {
                                return Apps.query_defaults().$promise.then( function( tiles ) {
                                    return $q.resolve( _(tiles).where( { application_id: 'MAIL' } ) );
                                } );
                            } else {
                                return Apps.query( { structure_id: user.active_profile().structure_id } ).$promise;
                            }
                        } );
                    };

                    // service.regroupements = function() {
                    //     return service.get().then( function success( response ) {
                    //         var user = new User( response.data );

                    //         return user.then( function( user ) {
                    //             console.log($http)
                    //             console.log(user)
                    //             $q.all( user.groups.map( function( group ) { return $http({ method: 'GET',
                    //                                                                         url: URL_ENT + '/api/groups/' + group.group_id }); } ) )
                    //                 .then( function( response ) {
                    //                     console.log(response)
                    //                 } );
                    //         } );
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
