'use strict';

angular.module( 'portailApp' )
    .factory( 'Apps',
              [ '$resource', 'URL_ENT', 'CONFIG',
                function( $resource, URL_ENT, CONFIG ) {
                    return $resource( URL_ENT + '/api/structures/:etab_code_uai/tuiles/:id',
                                      { id              : '@id',
                                        structure_id    : '@etab_code_uai',
                                        application_id	: '@application_id',
                                        index		: '@index',
                                        type		: '@type',
                                        name		: '@libelle',
                                        description	: '@description',
                                        url			: '@url',
                                        icon		: '@icon',
                                        color		: '@color' },
                                      { update: { method: 'PUT' },
                                        query: { method: 'GET',
                                                 cache: false,
                                                 url: URL_ENT + '/api/structures/:uai/tuiles',
                                                 params: { uai: '@uai' },
                                                 isArray: true,
                                                 transformResponse: function( response, _headers_getters ) {
                                                     return _(angular.fromJson( response ))
                                                         .map( function( app ) {
                                                             if ( !_( CONFIG.apps.default[app.application_id] ).isUndefined() ) {
                                                                 return _( CONFIG.apps.default[app.application_id] ).extend( app ); }
                                                             else {
                                                                 return app;
                                                             }
                                                         } );
                                                 } },
                                        query_defaults: { method: 'GET',
                                                          url: URL_ENT + '/api/applications',
                                                          isArray: true,
                                                          transformResponse: function( response, _headers_getters ) {
                                                              return _.chain(angular.fromJson( response ))
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
                                                          } } } );
                } ] );
