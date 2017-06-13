'use strict';

angular.module( 'portailApp' )
    .service( 'Annuaire',
              [ '$http', 'URL_ENT',
                function( $http, URL_ENT ) {
                    var service = this;

                    service.get_structure = _.memoize( function( structure_id ) {
                        return $http.get( URL_ENT + '/api/structures/' + structure_id );
                    } );

                    service.get_profile_type = _.memoize( function( type ) {
                        return $http.get( URL_ENT + '/api/profiles_types/' + type );
                    } );
                } ] );
