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
                                    return User.get({ id: response.data.id }).$promise;
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
                                        return $q.resolve( _(tiles).where( { application_id: 'MAIL' } ) );
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
                            var user_groups = $http.get( URL_ENT + '/api/groups/', { params: { 'id[]': _(user.groups).pluck('group_id') } } )
                                .then( function( response ) {
                                    return response.data;
                                } );
                            var structures_groups = $q.resolve();

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
