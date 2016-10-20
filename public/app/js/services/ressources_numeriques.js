'use strict';

angular.module( 'portailApp' )
    .factory( 'RessourceNumerique',
              [ '$resource', 'URL_ENT',
                function( $resource, URL_ENT ) {
                    return $resource( URL_ENT + 'api/etablissements/:id/ressources/:ressource_id',
                                      { id : '@id',
                                        ressource_id : '@ressource_id',
                                        ressource_num_id : '@ressource_num_id',
                                        date_deb_abon : '@date_deb_abon',
                                        date_fin_abon : '@date_fin_abon' },
                                      { query_default: { methode: 'GET',
                                                         url: URL_ENT + 'api/ressources/',
                                                         isArray: true } });
                } ] );
