'use strict';

angular.module( 'portailApp' )
  .factory( 'Flux',
  [ '$resource', 'URL_ENT',
    function( $resource, URL_ENT ) {
      return $resource( URL_ENT + '/api/flux/:id',
        {
          id: '@id',
          structure_id: '@structure_id',
          url: '@url',
          name: '@name'
        },
        {
          get: { isArray: true },
          update: { method: 'PUT' }
        } );
    }] );
