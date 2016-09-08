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

                               var log_and_open_link = function( context, url ) {
                                   log.add( context, url, null );
                                   $window.open( url, 'laclasseexterne' );
                               };

                               currentUser.ressources().then( function ( response ) {
                                   $scope.root = { class: 'ressources-numeriques',
                                                   laius: $sce.trustAsHtml( '<p class="laius">Retrouvez ici les ressources numériques que votre établissement a sélectionné pour vous. Ces ressources peuvent être des manuels scolaires en ligne, des dictionnaires, des sites proposant des ressources pour s\'entraîner, etc...</p><p class="laius"> Si rien n\'est affiché dans cette page, c\'est que votre établissement n\'a ps encore activé les ressources numériques. Vous pouvez contacter un de vos administrateur de l\'ENT pour lui demander l\'activation de celles-ci.</p>' ),
                                                   tiles: _(response).map( function( rn, i ) {
                                                       return { nom: rn.lib,
                                                                description: rn.nom_court,
                                                                action: function() { log_and_open_link( 'GAR', rn.url_access_get ); },
                                                                icon: '/app/node_modules/laclasse-common-client/images/' + rn.icone,
                                                                couleur: CASES[ i % 16 ].couleur };
                                                   } ) };
                               } );
                           } );
                   }
                 ]
               );
