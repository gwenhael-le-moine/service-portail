'use strict';

/* constant for static pages routing */
angular.module( 'portailApp' )
    .constant( 'CASES', [ { couleur: 'bleu' },
                          { couleur: 'jaune' },
                          { couleur: 'violet' },
                          { couleur: 'vert' },
                          { couleur: 'rouge' },
                          { couleur: 'vert' },
                          { couleur: 'bleu' },
                          { couleur: 'jaune' },
                          { couleur: 'violet' },
                          { couleur: 'bleu' },
                          { couleur: 'jaune' },
                          { couleur: 'rouge' },
                          { couleur: 'jaune' },
                          { couleur: 'rouge' },
                          { couleur: 'vert' },
                          { couleur: 'violet' } ] )
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
