'use strict';

angular.module( 'portailApp' )
    .controller( 'CCNCtrl',
                 [ '$rootScope', '$scope', '$state', '$sce', '$window', 'APP_PATH', 'log', 'apps',
                   function( $rootScope, $scope, $state, $sce, $window, APP_PATH, log, apps ) {
                       $scope.prefix = APP_PATH;

                       apps.query()
                           .then( function ( response ) {
                               if ( _.chain( response ).findWhere( { application_id: 'CCNUM' } ).isUndefined().value() ) {
                                   $state.go( 'portail.logged', {}, { reload: true, inherit: true, notify: true } );
                               }

                               var additional_tile = function() {
                                   if ( $rootScope.current_user.profil_actif.profil_id != 'TUT' && $rootScope.current_user.profil_actif.profil_id != 'ELV' ) {
                                       return { couleur: 'bleu inscription highlight-ccn',
                                                description: 'Inscription aux projets',
                                                action: function() { log_and_open_link( $scope.prefix + '/inscription_CCN_2016/index.html' ); },
                                                icon: '/app/node_modules/laclasse-common-client/images/06_thematiques.svg',
                                                nom: 'Inscription aux projets'};
                                   } else {
                                       return { couleur: 'bleu-moins' };
                                   }
                               };

                               var log_and_open_link = function( context, url ) {
                                   log.add( context, url, null );
                                   $window.open( url, 'laclasseexterne' );
                               };

                               $scope.tree = { class: 'classes-culturelles-numeriques',
                                               laius: $sce.trustAsHtml( '<p class="laius">Des collégiens qui jouent sur le web et sur scène avec des auteurs de théâtre et des écrivains, qui découvrent que design et développement durable peuvent s\'allier contre le gaspillage alimentaire, qui cartographient leur territoire grâce à la Big Data en compagnie d\'un philosophe, ou encore qui réalisent une enquête-expo sur la grande guerre avec les archives du Rhône, tout cela ce sont les Classes Culturelles Numériques de laclasse.com. 50 classes, du cm2 à la 3ème engagées dans 5 projets collaboratifs et innovants sur l\'ENT, à suivre en ligne toute l\'année, et lors des rencontres finales.</p>\
                                        <p class="laius">En partenariat avec <a href="http://www.ia69.ac-lyon.fr/" target="_blank">l\'Inspection Académique</a> et la DANE de <a href="http://www.ac-lyon.fr/" target="_blank">l\'Académie de Lyon</a>.</p>\
                                        <p class="laius">Inscriptions en mai : <a href="mailto:info@laclasse.com">info@laclasse.com</a></p>' ),
                                               tiles: [ { nom: '14-18',
                                                          description: '14-18',
                                                          action: function() { log_and_open_link( 'CCN', 'http://14-18.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui' ); },
                                                          icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_14-18.svg',
                                                          couleur: 'jaune' },
                                                        { nom: 'Zérogaspi',
                                                          description: 'Zérogaspi',
                                                          action: function() { log_and_open_link( 'CCN', 'http://zerogaspi.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui' ); },
                                                          icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_zero-gaspi.svg',
                                                          couleur: 'bleu' },
                                                        { nom: 'Théâtre',
                                                          description: 'Théâtre',
                                                          action: function() { log_and_open_link( 'CCN', 'http://theatre.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui' ); },
                                                          icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_theatre.svg',
                                                          couleur: 'rouge' },
                                                        { nom: 'AIR 2015',
                                                          description: 'Assises du Roman',
                                                          action: function() { log_and_open_link( 'CCN', 'http://air.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui' ); },
                                                          icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_air-2014.svg',
                                                          couleur: 'jaune' },
                                                        { nom: 'Habiter',
                                                          description: 'Représentations cartographiques de l\'espace vécu',
                                                          action: function() { log_and_open_link( 'CCN', 'http://habiter.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui' ); },
                                                          icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_habiter.svg',
                                                          couleur: 'vert' },
                                                        { nom: 'Projets archivés',
                                                          description: 'Projets archivés',
                                                          action: function() { $scope.root = this.leaves; },
                                                          icon: '/app/node_modules/laclasse-common-client/images/06_thematiques.svg',
                                                          couleur: 'gris1',
                                                          leaves: { class: 'classes-culturelles-numeriques',
                                                                    laius: $sce.trustAsHtml( '<p class="laius">Au fil des années, des projets pédagogiques, des résidences d\'artistes, de scientifiques, et d\'écrivains se sont déroulés dans tout le département du rhône, et parfois au delà, amenant plusieurs classes de différents établissements à travailler ensemble autour de l\'outil numérique.<br/>\
                                                              Retrouver et revisitez les travaux des classes sur ces projets, ici.<br/><br/>\
                                                              </p>' ),
                                                                    tiles: [ { nom: '← Retour aux projets en cours',
                                                                               description: '← Retour aux projets en cours',
                                                                               action: function() { console.log(this);$scope.root = $scope.tree; },
                                                                               icon: '/app/node_modules/laclasse-common-client/images/06_thematiques.svg',
                                                                               couleur: 'gris1' },
                                                                             { nom: 'Philo',
                                                                               description: 'Philo',
                                                                               action: function() { log_and_open_link( 'CCN', 'http://philo.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui' ); },
                                                                               icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_philo.svg',
                                                                               couleur: 'violet' },
                                                                             { couleur: 'gris2',
                                                                               action: function() { log_and_open_link( 'CCN', 'http://miam.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui' ); },
                                                                               icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_miam.svg',
                                                                               nom: 'Miam',
                                                                               titre: '' },
                                                                             { couleur: 'bleu',
                                                                               action: function() { log_and_open_link( 'CCN', 'http://novaterra.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui' ); },
                                                                               icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_odysseespatiale.svg',
                                                                               nom: 'Odyssée spatiale',
                                                                               titre: '' },
                                                                             { couleur: 'jaune',
                                                                               action: function() { log_and_open_link( 'CCN', 'http://archeologies.laclasse.com/' ); },
                                                                               icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_archeologie.svg',
                                                                               nom: 'Archéologie',
                                                                               titre: '' },
                                                                             { couleur: 'orange',
                                                                               action: function() { log_and_open_link( 'CCN', 'http://bd.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui' ); },
                                                                               icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_bd.svg',
                                                                               nom: 'BD',
                                                                               titre: '' },
                                                                             { couleur: 'violet',
                                                                               action: function() { log_and_open_link( 'CCN', 'http://cine.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui' ); },
                                                                               icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_cine.svg',
                                                                               nom: 'Ciné',
                                                                               titre: '' },
                                                                             { couleur: 'vert',
                                                                               action: function() { log_and_open_link( 'CCN', 'http://cluemo.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui' ); },
                                                                               icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_cluemo.svg',
                                                                               nom: 'Cluémo',
                                                                               titre: '' },
                                                                             { couleur: 'rouge',
                                                                               action: function() { log_and_open_link( 'CCN', 'http://etudiantsvoyageurs.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui' ); },
                                                                               icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_etudiantsvoyageurs.svg',
                                                                               nom: 'Etudiants voyageurs',
                                                                               titre: '' },
                                                                             { couleur: 'vert',
                                                                               action: function() { log_and_open_link( 'CCN', 'http://finisterrae.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui' ); },
                                                                               icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_finisterrae.svg',
                                                                               nom: 'Finisterrae',
                                                                               titre: '' },
                                                                             { couleur: 'gris4',
                                                                               action: function() { log_and_open_link( 'CCN', 'http://ledechetmatiere.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui' ); },
                                                                               icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_dechetmatiere.svg',
                                                                               nom: 'Le déchet matière',
                                                                               titre: '' },
                                                                             { couleur: 'violet',
                                                                               action: function() { log_and_open_link( 'CCN', 'http://maisondeladanse.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui' ); },
                                                                               icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_maisondeladanse.svg',
                                                                               nom: 'Maison de la danse',
                                                                               titre: '' },
                                                                             { couleur: 'bleu',
                                                                               action: function() { log_and_open_link( 'CCN', 'http://musique.laclasse.com/' ); },
                                                                               icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_musique.svg',
                                                                               nom: 'Musique',
                                                                               titre: '' },
                                                                             { couleur: 'jaune',
                                                                               action: function() { log_and_open_link( 'CCN', 'http://science.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui' ); },
                                                                               icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_science.svg',
                                                                               nom: 'Science',
                                                                               titre: '' },
                                                                             { couleur: 'orange',
                                                                               action: function() { log_and_open_link( 'CCN', 'http://picture.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui' ); },
                                                                               icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_picture.svg',
                                                                               nom: 'Picture',
                                                                               titre: '' } ] } } ] };

                               _($scope.tree.tiles).last().leaves.tiles.push( additional_tile() );
                               $scope.tree.tiles.push( additional_tile() );
                               $scope.tree.tiles = $scope.tree.tiles.concat( [ { couleur: 'vert-moins' },
                                                                               { couleur: 'bleu-moins' },
                                                                               { couleur: 'jaune-moins' },
                                                                               { couleur: 'violet-moins' },
                                                                               { couleur: 'bleu-moins' },
                                                                               { couleur: 'vert-moins' },
                                                                               { couleur: 'rouge-moins' },
                                                                               { couleur: 'bleu-moins' },
                                                                               { couleur: 'vert-moins' } ] );

                               $scope.root = $scope.tree;
                           } );
                   }
                 ]
               );
