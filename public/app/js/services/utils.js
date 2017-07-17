'use strict';

angular.module( 'portailApp' )
    .service( 'Utils',
              [ '$state', '$window', 'CASES', 'log',
                function( $state, $window, CASES, log ) {
                    this.pad_tiles_tree = function( tiles_tree ) {
                        var suffix = '-moins';
                        return tiles_tree.concat( _(CASES.slice( tiles_tree.length, CASES.length ))
                                                  .map( function( c, i ) {
                                                      return { index: i + tiles_tree.length,
                                                               color: c.color + suffix };
                                                  } ) );
                    };

                    this.fill_empty_tiles = function( tiles_tree ) {
                        var indexes = tiles_tree.map( function( tile ) { return tile.index; } );
                        _.chain(indexes)
                            .max()
                            .range()
                            .difference( indexes )
                            .each( function( index ) {
                                tiles_tree.push( { index: index,
                                                   color: CASES[ index % CASES.length ].color + '-moins' } );
                            } );

                        return tiles_tree;
                    };

                    this.log_and_open_link = function( context, url ) {
                        log.add( context, url, null );
                        $window.open( url );
                    };

                    this.go_home = function() {
                        $state.go( 'portail', {}, { reload: true, inherit: true, notify: true } );
                    };
                }
              ] );
