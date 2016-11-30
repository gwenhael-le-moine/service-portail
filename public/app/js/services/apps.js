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
                                                          url: APP_PATH + '/api/apps/default/',
                                                          isArray: true } } );
                } ] );

angular.module( 'portailApp' )
    .service( 'apps',
              [ 'Apps',
                function( Apps ) {
                    this.defaults = function() {
                        return Apps.query_defaults().$promise
                            .then( function( response ) {
                                return _.chain(response)
                                    .reject( function( app ) {
                                        var apps_to_hide = ['ANNUAIRE', 'ANN_ENT', 'PORTAIL', 'SSO', 'STARTBOX'];

                                        return _(apps_to_hide).includes( app.id );
                                    } )
                                    .map( function( app ) {
                                        app.type = 'INTERNAL';
                                        app.application_id = app.id;
                                        delete app.id;

                                        return app;
                                    } )
                                    .value();
                            } );
                    };

                    this.query = function() {
                        return Apps.query().$promise;
                    };
                }
              ] );
