'use strict';

angular.module( 'portailApp' )
    .factory( 'Apps',
              [ '$resource', 'URL_ENT', 'CONFIG',
                function( $resource, URL_ENT, CONFIG ) {
                    return $resource( URL_ENT + '/api/portail/entree/:id',
                                      { id              : '@id',
                                        etab_code_uai   : '@etab_code_uai',
                                        application_id	: '@application_id',
                                        index		: '@index',
                                        type		: '@type',
                                        libelle		: '@libelle',
                                        description	: '@description',
                                        url		: '@url',
                                        active		: '@active',
                                        icon		: '@icon',
                                        color		: '@color' },
                                      { update: { method: 'PUT' },
                                        query: { method: 'GET',
                                                 cache: false,
                                                 url: URL_ENT + '/api/portail/entree/etablissement/:uai',
                                                 params: { uai: '@uai' },
                                                 isArray: true,
                                                 transformResponse: function( response, _headers_getters ) {
                                                     return _(angular.fromJson( response ))
                                                         .map( function( app ) {
                                                             return _(app).extend( CONFIG.apps.default[app.application_id] );
                                                         } );
                                                 } },
                                        query_defaults: { method: 'GET',
                                                          url: URL_ENT + '/api/portail/entree/applications',
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
