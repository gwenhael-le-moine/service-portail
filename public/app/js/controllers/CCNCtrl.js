'use strict';

angular.module( 'portailApp' )
    .controller( 'CCNCtrl',
                 [ '$rootScope', '$scope', '$state', '$window', 'APP_PATH', 'log', 'apps',
                   function( $rootScope, $scope, $state, $window, APP_PATH, log, apps ) {
                       $scope.prefix = APP_PATH;
                       $scope.display_archives = true;

                       apps.query()
                           .then( function ( response ) {
                               if ( _.chain( response ).findWhere( { application_id: 'CCNUM' } ).isUndefined().value() ) {
                                   $state.go( 'portail.logged', {}, { reload: true, inherit: true, notify: true } );
                               }

                               var additional_tile = { couleur: 'bleu-moins' };
                               if ( $rootScope.current_user.profil_actif.profil_id != 'TUT' && $rootScope.current_user.profil_actif.profil_id != 'ELV' ) {
                                   additional_tile = { couleur: 'bleu inscription highlight-ccn',
                                                       url: $scope.prefix + '/inscription_CCN_2016/index.html',
                                                       icon: '/app/node_modules/laclasse-common-client/images/06_thematiques.svg',
                                                       nom: 'Inscription aux projets'};
                               }

                               $scope.thematiques_actuelles = [
                                   { nom: '14-18',
                                     description: '14-18',
                                     url: 'http://14-18.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui',
                                     icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_14-18.svg',
                                     couleur: 'jaune' },
                                   { nom: 'Zérogaspi',
                                     description: 'Zérogaspi',
                                     url: 'http://zerogaspi.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui',
                                     icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_zero-gaspi.svg',
                                     couleur: 'bleu' },
                                   { nom: 'Théâtre',
                                     description: 'Théâtre',
                                     url: 'http://theatre.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui',
                                     icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_theatre.svg',
                                     couleur: 'rouge' },
                                   { nom: 'AIR 2015',
                                     description: 'Assises du Roman',
                                     url: 'http://air.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui',
                                     icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_air-2014.svg',
                                     couleur: 'jaune' },
                                   { nom: 'Habiter',
                                     description: 'Représentations cartographiques de l\'espace vécu',
                                     url: 'http://habiter.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui',
                                     icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_habiter.svg',
                                     couleur: 'vert' },
                                   { nom: 'Projets archivés',
                                     description: 'Projets archivés',
                                     url: 'toggle_archives',
                                     icon: '/app/node_modules/laclasse-common-client/images/06_thematiques.svg',
                                     couleur: 'gris1' } ];
                               $scope.thematiques_actuelles.push( additional_tile );
                               $scope.thematiques_actuelles = $scope.thematiques_actuelles.concat( [ { couleur: 'vert-moins' },
                                                                                                     { couleur: 'bleu-moins' },
                                                                                                     { couleur: 'jaune-moins' },
                                                                                                     { couleur: 'violet-moins' },
                                                                                                     { couleur: 'bleu-moins' },
                                                                                                     { couleur: 'vert-moins' },
                                                                                                     { couleur: 'rouge-moins' },
                                                                                                     { couleur: 'bleu-moins' },
                                                                                                     { couleur: 'vert-moins' } ] );

                               $scope.thematiques_archivees = [
                                   { nom: '← Retour aux projets en cours',
                                     description: '← Retour aux projets en cours',
                                     url: 'toggle_archives',
                                     icon: '/app/node_modules/laclasse-common-client/images/06_thematiques.svg',
                                     couleur: 'gris1' },
                                   { nom: 'Philo',
                                     description: 'Philo',
                                     url: 'http://philo.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui',
                                     icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_philo.svg',
                                     couleur: 'violet' },
                                   { couleur: 'gris2',
                                     url: 'http://miam.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui',
                                     icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_miam.svg',
                                     nom: 'Miam',
                                     titre: ''
                                   },
                                   { couleur: 'bleu',
                                     url: 'http://novaterra.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui',
                                     icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_odysseespatiale.svg',
                                     nom: 'Odyssée spatiale',
                                     titre: ''
                                   },
                                   { couleur: 'jaune',
                                     url: 'http://archeologies.laclasse.com/',
                                     icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_archeologie.svg',
                                     nom: 'Archéologie',
                                     titre: ''
                                   },
                                   { couleur: 'orange',
                                     url: 'http://bd.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui',
                                     icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_bd.svg',
                                     nom: 'BD',
                                     titre: ''
                                   },
                                   { couleur: 'violet',
                                     url: 'http://cine.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui',
                                     icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_cine.svg',
                                     nom: 'Ciné',
                                     titre: ''
                                   },
                                   { couleur: 'vert',
                                     url: 'http://cluemo.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui',
                                     icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_cluemo.svg',
                                     nom: 'Cluémo',
                                     titre: ''
                                   },
                                   { couleur: 'rouge',
                                     url: 'http://etudiantsvoyageurs.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui',
                                     icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_etudiantsvoyageurs.svg',
                                     nom: 'Etudiants voyageurs',
                                     titre: ''
                                   },
                                   { couleur: 'vert',
                                     url: 'http://finisterrae.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui',
                                     icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_finisterrae.svg',
                                     nom: 'Finisterrae',
                                     titre: ''
                                   },
                                   { couleur: 'gris4',
                                     url: 'http://ledechetmatiere.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui',
                                     icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_dechetmatiere.svg',
                                     nom: 'Le déchet matière',
                                     titre: ''
                                   },
                                   { couleur: 'violet',
                                     url: 'http://maisondeladanse.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui',
                                     icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_maisondeladanse.svg',
                                     nom: 'Maison de la danse',
                                     titre: ''
                                   },
                                   { couleur: 'bleu',
                                     url: 'http://musique.laclasse.com/',
                                     icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_musique.svg',
                                     nom: 'Musique',
                                     titre: ''
                                   },
                                   { couleur: 'jaune',
                                     url: 'http://science.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui',
                                     icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_science.svg',
                                     nom: 'Science',
                                     titre: ''
                                   },
                                   { couleur: 'orange',
                                     url: 'http://picture.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui',
                                     icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_picture.svg',
                                     nom: 'Picture',
                                     titre: ''
                                   }
                               ];
                               $scope.thematiques_archivees.push( additional_tile );

                               $scope.log_and_open_link = function( url ) {
                                   if ( url === 'toggle_archives' ) {
                                       $scope.toggle_archives();
                                   } else {
                                       log.add( 'CCN', url, null );
                                       $window.open( url, 'laclasseexterne' );
                                   }
                               };

                               $scope.toggle_archives = function() {
                                   $scope.display_archives = !$scope.display_archives;
                                   $scope.thematiques = $scope.display_archives ? $scope.thematiques_archivees : $scope.thematiques_actuelles;
                               };

                               $scope.toggle_archives();
                           } );
                   }
                 ]
               );
