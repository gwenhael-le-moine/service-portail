'use strict';

angular.module( 'portailApp' )
    .factory( 'Flux',
              [ '$resource', 'URL_ENT',
                function( $resource, URL_ENT ) {
                    return $resource( URL_ENT + '/api/portail/flux/:id',
                                      { id: '@id',
                                        etab_code_uai: '@etab_code_uai',
                                        nb: '@nb',
                                        icon: '@icon',
                                        flux: '@flux',
                                        title: '@title' },
                                      { get: { isArray: true },
                                        update: { method: 'PUT' } } );
                } ] );
