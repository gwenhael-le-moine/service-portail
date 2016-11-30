'use strict';

angular.module( 'portailApp' )
    .factory( 'Apps',
              [ '$resource', 'URL_ENT', 'APP_PATH',
                function( $resource, URL_ENT, APP_PATH ) {
                    return $resource( APP_PATH + '/api/apps/:id', //URL_ENT + '/api/portail/entree/applications/:id',
                                      { id              : '@id',
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
                                        query_defaults: { methode: 'GET',
                                                          url: URL_ENT + '/api/portail/entree/applications',
                                                          isArray: true } } );
                } ] );

angular.module( 'portailApp' )
    .service( 'apps',
              [ 'Apps', 'CONFIG',
                function( Apps, CONFIG ) {
                    this.defaults = function() {
                        return Apps.query_defaults().$promise
                            .then( function( response ) {
                                return _.chain(response)
                                    .reject( function( app ) {
                                        var apps_to_hide = ['ANNUAIRE', 'ANN_ENT', 'PORTAIL', 'SSO', 'STARTBOX'];

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
                    };

                    this.query = function() {
                        return Apps.query().$promise;
                    };
                }
              ] );
