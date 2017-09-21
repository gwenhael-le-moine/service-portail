'use strict';

angular.module( 'portailApp' )
  .factory( 'Tiles',
  [ '$resource', 'URL_ENT', 'CONFIG',
    function( $resource, URL_ENT, CONFIG ) {
      var Tile = $resource( URL_ENT + '/api/tiles/:id',
        {
          id: '@id',
          structure_id: '@structure_id',
          application_id: '@application_id',
          index: '@index',
          type: '@type',
          name: '@name',
          description: '@description',
          url: '@url',
          icon: '@icon',
          color: '@color'
        },
        {
          update: { method: 'PUT' },
          query: {
            method: 'GET',
            cache: false,
            isArray: true,
            transformResponse: function( response, _headers_getters ) {
              return _( angular.fromJson( response ) )
                .map( function( app ) {
                  if ( !_( CONFIG.apps.default[ app.application_id ] ).isUndefined() ) {
                    return _( CONFIG.apps.default[ app.application_id ] ).extend( app );
                  }
                  else {
                    return app;
                  }
                } );
            }
          }
        } );
      return Tile;
    }] );
