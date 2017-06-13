'use strict';

angular.module( 'portailApp' )
    .service( 'currentUser',
              [ '$http', '$resource', '$q', 'URL_ENT', 'User', 'Tiles', 'Annuaire',
                function( $http, $resource, $q, URL_ENT, User, Tiles, Annuaire ) {
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
                            return Annuaire.get_structure_resources( user.active_profile().structure_id )
                                .then( function( response ) {
                                    return response.data;
                                } );
                        } );
                    };

                    service.tiles = function() {
                        return service.get().then( function success( user ) {
                            if ( _(user.profiles).isEmpty() ) {
                                return Annuaire.query_applications()
                                    .then( function( tiles ) {
                                        return $q.resolve( _(tiles).where( { application_id: 'MAIL' } ) );
                                    } );
                            } else {
                                return Tiles.query( { structure_id: user.active_profile().structure_id } ).$promise;
                            }
                        } );
                    };

                    service.regroupements = function() {
                        return service.get().then( function success( user ) {
                            return $q.all( user.groups.map( function( group ) {
                                return $http.get( URL_ENT + '/api/groups/', { params: { id: group.group_id } } );
                            } ) )
                                .then( function( response ) {
                                    return _.chain(response).pluck('data').flatten().value();
                                } );
                        } );
                    };
                } ] );
