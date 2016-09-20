'use strict';

angular.module( 'portailApp' )
    .factory( 'RessourceNumerique',
              [ '$resource', 'URL_ENT',
                function( $resource, URL_ENT ) {
                    return $resource( URL_ENT + 'api/ressources/:id' );
                } ] );
