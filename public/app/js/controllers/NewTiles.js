'use strict';

angular.module( 'portailApp' )
    .controller( 'NewTilesCtrl',
                 [ '$scope', '$sce', '$state', 'CASES', 'currentUser', 'Utils', 'CCN',
                   function( $scope, $sce, $state, CASES, currentUser, Utils, CCN ) {
                       $scope.tiles_templates = { app: 'views/new_tile_app.html',
                                                  back: 'views/new_tile_app.html',
                                                  regroupement: 'views/new_tile_regroupement.html',
                                                  eleve: 'views/new_tile_eleve.html',
                                                  rn: 'views/new_tile_rn.html',
                                                  ccn: 'views/new_tile_ccn.html' };

                       var fill_empty_tiles = function( tiles_tree ) {
                           var indexes = tiles_tree.map( function( tile ) { return tile.index; } );
                           _.chain(indexes)
                               .max()
                               .range()
                               .difference( indexes )
                               .each( function( index ) {
                                   tiles_tree.push( { index: index,
                                                      couleur: CASES[ index % CASES.length ].couleur + '-moins' } );
                               } );

                           return tiles_tree;
                       };

                       var go_to_root_tile = { action: function() { $scope.tree = $scope.apps; },
                                               taxonomy: 'back',
                                               libelle: '↰ Retour',
                                               description: 'Retour' };

                       currentUser.apps().then( function( response ) {
                           $scope.apps = response.map( function( app ) {
                               app.taxonomy = 'app';

                               var go_to_parent_tile = function( parent ) {
                                   var back_to_parent = angular.copy( go_to_root_tile );
                                   back_to_parent.action = parent.action;

                                   return back_to_parent;
                               };

                               switch( app.application_id ) {
                               case 'CCNUM':
                                   app.action = function() {
                                       $scope.tree = Utils.pad_tiles_tree( [ go_to_root_tile ].concat( CCN.query().map( function( ccn ) {
                                           ccn.taxonomy = 'ccn';

                                           if ( _(ccn).has('leaves') ) {
                                               ccn.action = function() {
                                                   $scope.tree = [ go_to_parent_tile( app ) ].concat( ccn.leaves.map( function( ccn ) {
                                                       ccn.taxonomy = 'ccn';
                                                       return ccn;
                                                   } ) );
                                               };
                                           }
                                           return ccn;
                                       } ) ) );
                                   };
                                   break;
                               case 'GAR':
                                   app.action = function() {
                                       currentUser.ressources().then( function ( response ) {
                                           $scope.tree = Utils.pad_tiles_tree( [ go_to_root_tile ].concat( response.map( function( rn, i ) {
                                               rn.taxonomy = 'rn';
                                               rn.icon = '/app/node_modules/laclasse-common-client/images/' + rn.icon;
                                               rn.couleur = CASES[ i % 16 ].couleur;
                                               rn.action = function() { Utils.log_and_open_link( 'GAR', rn.url ); };

                                               return rn;
                                           } ) ) );
                                       } );
                                   };
                                   break;
                               case 'TROMBI':
                                   app.action = function() {
                                       currentUser.regroupements().then( function ( response ) {
                                           $scope.tree = Utils.pad_tiles_tree( [ go_to_root_tile ].concat( response.map( function( regroupement, i ) {
                                               regroupement.taxonomy = 'regroupement';
                                               regroupement.couleur = regroupement.type === 'classe' ? 'vert' : 'bleu';
                                               regroupement.couleur += i % 2 == 0 ? '' : '-moins';
                                               regroupement.action = function() {
                                                   currentUser.eleves_regroupement( regroupement.id )
                                                       .then( function( response ) {
                                                           $scope.tree = Utils.pad_tiles_tree( [ go_to_parent_tile( app ) ].concat( response.map( function( eleve ) {
                                                               eleve.taxonomy = 'eleve';
                                                               eleve.couleur = 'jaune';
                                                               eleve.couleur += i % 2 == 0 ? '' : '-moins';

                                                               return eleve;
                                                           } ) ) );
                                                       } );
                                               };

                                               return regroupement;
                                           } ) ) );
                                       } );
                                   };
                                   break;
                               default:
                                   app.action = function() {
                                       if ( !_(app.application_id).isNull() ) {
                                           $state.go( 'app.external', { app: app.application_id } );
                                       } else {
                                           Utils.log_and_open_link( app.application_id == 'PRONOTE' ? 'PRONOTE' : 'EXTERNAL', app.url );
                                       }
                                   };
                               }

                               return app;
                           } );
                           $scope.apps = fill_empty_tiles( $scope.apps );
                           $scope.apps = Utils.pad_tiles_tree( $scope.apps );

                           $scope.tree = $scope.apps;
                       } );
                   } ] );
