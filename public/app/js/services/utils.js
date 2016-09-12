'use strict';

angular.module( 'portailApp' )
    .service( 'Utils',
              [ '$state', '$window', 'CASES', 'log',
                function( $state, $window, CASES, log ) {
                    this.pad_tiles_tree = function( tiles_tree ) {
                        return tiles_tree.concat( _(CASES.slice( tiles_tree.length, CASES.length ))
                                                  .map( function( c ) {
                                                      return { couleur: c.couleur + '-moins' };
                                                  } ) );
                    };

                    this.log_and_open_link = function( context, url ) {
                        log.add( context, url, null );
                        $window.open( url, 'laclasseexterne' );
                    };

                    this.go_home = function() {
                        $state.go( 'portail.tiles', {}, { reload: true, inherit: true, notify: true } );
                    };
                }
              ] );
