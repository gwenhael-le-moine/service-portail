'use strict';

angular.module( 'portailApp' )
    .service( 'Annuaire',
              [ '$http', 'URL_ENT', 'CONFIG',
                function( $http, URL_ENT, CONFIG ) {
                    var service = this;

                    service.get_structure = _.memoize( function( structure_id ) {
                        return $http.get( URL_ENT + '/api/structures/' + structure_id, { params: { expand: false } } );
                    } );

                    service.get_structure_tiles = _.memoize( function( structure_id ) {
                        return $http.get( URL_ENT + '/api/tiles/', { params: { structure_id: structure_id } } );
                    } );

                    service.query_applications = _.memoize( function( structure_id ) {
                        return $http.get( URL_ENT + '/api/applications/' )
                            .then( function( response ) {
                                return _.chain( response.data )
                                    .reject( function( app ) {
                                        var apps_to_hide = [ 'ANNUAIRE', 'ANN_ENT', 'PORTAIL', 'SSO', 'STARTBOX' ];

                                        return _(apps_to_hide).includes( app.id );
                                    } )
                                    .map( function( app ) {
                                        if ( _(CONFIG.apps.default[app.id]) ) {
                                            app.type = 'INTERNAL';
                                            app.application_id = app.id;
                                            delete app.id;

                                            return _(app).extend( CONFIG.apps.default[app.application_id] );
                                        } else {
                                            return null;
                                        }
                                    } )
                                    .compact()
                                    .value();
                            } );
                    } );

                    service.get_structure_resources = _.memoize( function( structure_id ) {
                        return $http.get( URL_ENT + '/api/resources/', { params: { structure_id: structure_id } } );
                    } );

                    service.get_profile_type = _.memoize( function( type ) {
                        return $http.get( URL_ENT + '/api/profiles_types/' + type );
                    } );

                    service.get_resource = _.memoize( function( id ) {
                        return $http.get( URL_ENT + '/api/resources/' + id );
                    } );
                } ] );
