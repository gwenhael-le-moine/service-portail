'use strict';

angular.module( 'portailApp' )
    .service( 'currentUser',
              [ '$http', '$resource', '$q', 'URL_ENT', 'User', 'Tiles', 'Annuaire',
                function( $http, $resource, $q, URL_ENT, User, Tiles, Annuaire ) {
                    var service = this;
                    var current_user = undefined;

                    service.get = function( force_reload ) {
                        if ( _(current_user).isUndefined() || force_reload ) {
                            current_user = $http.get( URL_ENT + '/api/users/current' )
                                .then( function( response ) {
                                    return new User( response.data );
                                } );
                        }

                        return current_user;
                    };

                    service.activate_profile = function( profile_id ) {
                        return service.get( false ).then( function success( user ) {
                            return $http({ method: 'PUT',
                                           url: URL_ENT + '/api/users/' + user.id + '/profiles/' + profile_id,
                                           data: { active: true } } );
                        } );
                    };

                    service.ressources = function() {
                        return service.get( false ).then( function success( user ) {
                            return Annuaire.get_structure_resources( user.active_profile().structure_id )
                                .then( function( response ) {
                                    return response.data;
                                } );
                        } );
                    };

                    service.tiles = function() {
                        return service.get( false ).then( function success( user ) {
                            if ( _(user.profiles).isEmpty() ) {
                                return Annuaire.query_applications()
                                    .then( function( tiles ) {
                                        var no_profile_tiles = _.chain(tiles)
                                            .select( function( tile ) {
                                                return _(['MAIL', 'DOC']).includes( tile.application_id );
                                            } )
                                            .map( function( tile ) {
                                                tile.summer = true;

                                                return tile;
                                            } )
                                            .value();

                                        return $q.resolve( no_profile_tiles );
                                    } );
                            } else {
                                return Tiles.query( { structure_id: user.active_profile().structure_id } ).$promise;
                            }
                        } );
                    };

                    service.groups = function() {
                        return service.get( false ).then( function success( user ) {
                            var structures_ids = _.chain(user.profiles).pluck( 'structure_id' ).uniq().value();

                            var structures = Annuaire.get_structures( structures_ids );
                            var user_groups_ids = _(user.groups).pluck('group_id');
                            var user_groups = _(user_groups_ids).isEmpty() ? $q.resolve([]) : $http.get( URL_ENT + '/api/groups/', { params: { 'id[]': user_groups_ids } } )
                                .then( function( response ) {
                                    return response.data;
                                } );
                            var structures_groups = $q.resolve([]);

                            if ( _.chain(user.profiles).pluck( 'type' ).intersection([ 'DIR', 'ADM', 'CPE' ]).value().length > 0 ) {
                                structures_groups = $http.get( URL_ENT + '/api/groups/', { params: { 'structure_id[]': structures_ids } } )
                                    .then( function( response ) {
                                        return response.data;
                                    } );
                            }

                            return $q.all([ user_groups, structures_groups, structures ])
                                .then( function success( responses ) {
                                    var structures = responses.pop().data;
                                    return _.chain(responses)
                                        .flatten()
                                        .uniq('id')
                                        .map( function( group ) {
                                            group.structure = _(structures).findWhere({ id: group.structure_id });

                                            return group;
                                        } )
                                        .value();
                                } );
                        } );
                    };
                } ] );
