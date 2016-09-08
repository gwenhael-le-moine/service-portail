'use strict';

angular.module( 'portailApp' )
    .controller( 'RessourcesNumeriquesCtrl',
                 [ '$scope', '$sce', '$state', '$window', 'currentUser', 'APP_PATH', 'CASES', 'log', 'apps',
                   function( $scope, $sce, $state, $window, currentUser, APP_PATH, CASES, log, apps ) {
                       $scope.prefix = APP_PATH;

                       apps.query()
                           .then( function ( response ) {
                               if ( _.chain( response ).findWhere( { application_id: 'GAR' } ).isUndefined().value() ) {
                                   $state.go( 'portail.logged', {}, { reload: true, inherit: true, notify: true } );
                               }

                               currentUser.ressources().then( function ( response ) {
                                   var pad_tiles_tree = function( tiles_tree ) {
                                       if ( tiles_tree.length < CASES.length ) {
                                           return tiles_tree.concat( _.chain(CASES.slice( tiles_tree.length, CASES.length )).map( function( c ) {
                                               c.couleur += '-moins';
                                               return c;
                                           } ).value() );
                                       } else {
                                           return tiles_tree;
                                       }
                                   };

                                   $scope.root = { class: 'ressources-numeriques',
                                                   laius: $sce.trustAsHtml( '<p class="laius">Retrouvez ici les ressources numériques que votre établissement a sélectionné pour vous. Ces ressources peuvent être des manuels scolaires en ligne, des dictionnaires, des sites proposant des ressources pour s\'entraîner, etc...</p><p class="laius"> Si rien n\'est affiché dans cette page, c\'est que votre établissement n\'a ps encore activé les ressources numériques. Vous pouvez contacter un de vos administrateur de l\'ENT pour lui demander l\'activation de celles-ci.</p>' ),
                                                   tiles: _(response).map( function( rn, i ) {
                                                       rn.icon = '/app/node_modules/laclasse-common-client/images/' + rn.icon;
                                                       rn.couleur = CASES[ i % 16 ].couleur;
                                                       rn.action = function() {
                                                           log.add( 'GAR', rn.url, null );
                                                           $window.open( rn.url, 'laclasseexterne' );
                                                       };

                                                       return rn;
                                                   } ) };

                                   $scope.root.tiles = pad_tiles_tree( $scope.root.tiles );
                               } );
                           } );
                   }
                 ]
               );
