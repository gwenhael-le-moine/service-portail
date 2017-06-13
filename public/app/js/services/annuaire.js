'use strict';

angular.module( 'portailApp' )
    .service( 'Annuaire',
              [ '$http', 'URL_ENT',
                function( $http, URL_ENT ) {
                    var service = this;

                    service.get_structure = _.memoize( function( structure_id ) {
                        return $http.get( URL_ENT + '/api/structures/' + structure_id, { params: { expand: false } } );
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
