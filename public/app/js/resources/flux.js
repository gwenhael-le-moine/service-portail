'use strict';

angular.module( 'portailApp' )
    .factory( 'Flux',
              [ '$resource', 'URL_ENT',
                function( $resource, URL_ENT ) {
                    return $resource( URL_ENT + '/api/structures/:structure_id/flux/:id',
                                      { id: '@id',
                                        structure_id: '@structure_id',
                                        nb: '@nb',
                                        url: '@url',
                                        name: '@name' },
                                      { get: { isArray: true },
                                        update: { method: 'PUT' } } );
                } ] );
