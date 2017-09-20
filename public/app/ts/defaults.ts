'use strict';

/* constant for static pages routing */
angular.module( 'portailApp' )
    .constant( 'CASES', [ { color: 'bleu' },
                          { color: 'jaune' },
                          { color: 'violet' },
                          { color: 'vert' },
                          { color: 'rouge' },
                          { color: 'vert' },
                          { color: 'bleu' },
                          { color: 'jaune' },
                          { color: 'violet' },
                          { color: 'bleu' },
                          { color: 'jaune' },
                          { color: 'rouge' },
                          { color: 'jaune' },
                          { color: 'rouge' },
                          { color: 'vert' },
                          { color: 'violet' } ] )
    .constant( 'COULEURS', [ '#1aa1cc',
                             '#80ba66',
                             '#eb5454',
                             '#9c75ab',
                             '#e8c254' ] )
    .factory( 'RANDOM_IMAGES', [ 'APP_PATH',
                                 function( APP_PATH ) {
                                     return [ APP_PATH + '/app/node_modules/laclasse-common-client/images/logolaclasse.svg',
                                              APP_PATH + '/app/node_modules/laclasse-common-client/images/random/20150116_102448.jpg',
                                              APP_PATH + '/app/node_modules/laclasse-common-client/images/random/20150204_152946.jpg' ];
                                 } ] );
