'use strict';

angular.module( 'portailApp' )
    .controller( 'CCNCtrl',
                 [ '$rootScope', '$scope', '$state', '$sce', '$window', 'APP_PATH', 'Utils', 'log', 'apps',
                   function( $rootScope, $scope, $state, $sce, $window, APP_PATH, Utils, log, apps ) {
                       $scope.prefix = APP_PATH;

                       var add_additional_tile = function( tiles_tree ) {
                           if ( $rootScope.current_user.profil_actif.profil_id != 'TUT' && $rootScope.current_user.profil_actif.profil_id != 'ELV' ) {
                               return tiles_tree.concat( [ { couleur: 'bleu inscription highlight-ccn',
                                                             description: 'Inscription aux projets',
                                                             action: function() { Utils.log_and_open_link( $scope.prefix + '/inscription_CCN_2016/index.html' ); },
                                                             icon: '/app/node_modules/laclasse-common-client/images/06_thematiques.svg',
                                                             nom: 'Inscription aux projets' } ] );
                           } else {
                               return tiles_tree;
                           }
                       };

                       apps.query()
                           .then( function ( response ) {
                               if ( _.chain( response ).findWhere( { application_id: 'CCNUM' } ).isUndefined().value() ) {
                                   Utils.go_home();
                               }

                               $scope.tree = { class: 'classes-culturelles-numeriques',
                                               laius: $sce.trustAsHtml( '<p class="laius">Des collégiens qui jouent sur le web et sur scène avec des auteurs de théâtre et des écrivains, qui découvrent que design et développement durable peuvent s\'allier contre le gaspillage alimentaire, qui cartographient leur territoire grâce à la Big Data en compagnie d\'un philosophe, ou encore qui réalisent une enquête-expo sur la grande guerre avec les archives du Rhône, tout cela ce sont les Classes Culturelles Numériques de laclasse.com. 50 classes, du cm2 à la 3ème engagées dans 5 projets collaboratifs et innovants sur l\'ENT, à suivre en ligne toute l\'année, et lors des rencontres finales.</p>\
                                        <p class="laius">En partenariat avec <a href="http://www.ia69.ac-lyon.fr/" target="_blank">l\'Inspection Académique</a> et la DANE de <a href="http://www.ac-lyon.fr/" target="_blank">l\'Académie de Lyon</a>.</p>\
                                        <p class="laius">Inscriptions en mai : <a href="mailto:info@laclasse.com">info@laclasse.com</a></p>' ),
                                               tiles: Utils.pad_tiles_tree( add_additional_tile( [ { nom: '14-18',
                                                                                                     description: '14-18',
                                                                                                     icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_14-18.svg',
                                                                                                     couleur: 'jaune',
                                                                                                     action: function() { Utils.log_and_open_link( 'CCN', 'http://14-18.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui' ); } },
                                                                                                   { nom: 'Zérogaspi',
                                                                                                     description: 'Zérogaspi',
                                                                                                     icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_zero-gaspi.svg',
                                                                                                     couleur: 'bleu',
                                                                                                     action: function() { Utils.log_and_open_link( 'CCN', 'http://zerogaspi.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui' ); } },
                                                                                                   { nom: 'Théâtre',
                                                                                                     description: 'Théâtre',
                                                                                                     icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_theatre.svg',
                                                                                                     couleur: 'rouge',
                                                                                                     action: function() { Utils.log_and_open_link( 'CCN', 'http://theatre.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui' ); } },
                                                                                                   { nom: 'AIR 2015',
                                                                                                     description: 'Assises du Roman',
                                                                                                     icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_air-2014.svg',
                                                                                                     couleur: 'jaune',
                                                                                                     action: function() { Utils.log_and_open_link( 'CCN', 'http://air.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui' ); } },
                                                                                                   { nom: 'Habiter',
                                                                                                     description: 'Représentations cartographiques de l\'espace vécu',
                                                                                                     icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_habiter.svg',
                                                                                                     couleur: 'vert',
                                                                                                     action: function() { Utils.log_and_open_link( 'CCN', 'http://habiter.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui' ); } },
                                                                                                   { nom: 'Projets archivés',
                                                                                                     description: 'Projets archivés',
                                                                                                     icon: '/app/node_modules/laclasse-common-client/images/06_thematiques.svg',
                                                                                                     couleur: 'gris1',
                                                                                                     action: function() { $scope.root = { class: 'classes-culturelles-numeriques',
                                                                                                                                          laius: $sce.trustAsHtml( '<p class="laius">Au fil des années, des projets pédagogiques, des résidences d\'artistes, de scientifiques, et d\'écrivains se sont déroulés dans tout le département du rhône, et parfois au delà, amenant plusieurs classes de différents établissements à travailler ensemble autour de l\'outil numérique.<br/>\
                                                              Retrouver et revisitez les travaux des classes sur ces projets, ici.<br/><br/>\
                                                              </p>' ),
                                                                                                                                          tiles: Utils.pad_tiles_tree( add_additional_tile( [ { nom: '← Retour aux projets en cours',
                                                                                                                                                                                                description: '← Retour aux projets en cours',
                                                                                                                                                                                                icon: '/app/node_modules/laclasse-common-client/images/06_thematiques.svg',
                                                                                                                                                                                                couleur: 'gris1',
                                                                                                                                                                                                action: function() { $scope.root = $scope.tree; } },
                                                                                                                                                                                              { nom: 'Philo',
                                                                                                                                                                                                description: 'Philo',
                                                                                                                                                                                                action: function() { Utils.log_and_open_link( 'CCN', 'http://philo.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui' ); },
                                                                                                                                                                                                icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_philo.svg',
                                                                                                                                                                                                couleur: 'violet' },
                                                                                                                                                                                              { couleur: 'gris2',
                                                                                                                                                                                                icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_miam.svg',
                                                                                                                                                                                                nom: 'Miam',
                                                                                                                                                                                                titre: '',
                                                                                                                                                                                                action: function() { Utils.log_and_open_link( 'CCN', 'http://miam.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui' ); } },
                                                                                                                                                                                              { couleur: 'bleu',
                                                                                                                                                                                                icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_odysseespatiale.svg',
                                                                                                                                                                                                nom: 'Odyssée spatiale',
                                                                                                                                                                                                titre: '',
                                                                                                                                                                                                action: function() { Utils.log_and_open_link( 'CCN', 'http://novaterra.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui' ); } },
                                                                                                                                                                                              { couleur: 'jaune',
                                                                                                                                                                                                icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_archeologie.svg',
                                                                                                                                                                                                nom: 'Archéologie',
                                                                                                                                                                                                titre: '',
                                                                                                                                                                                                action: function() { Utils.log_and_open_link( 'CCN', 'http://archeologies.laclasse.com/' ); } },
                                                                                                                                                                                              { couleur: 'orange',
                                                                                                                                                                                                icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_bd.svg',
                                                                                                                                                                                                nom: 'BD',
                                                                                                                                                                                                titre: '',
                                                                                                                                                                                                action: function() { Utils.log_and_open_link( 'CCN', 'http://bd.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui' ); } },
                                                                                                                                                                                              { couleur: 'violet',
                                                                                                                                                                                                icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_cine.svg',
                                                                                                                                                                                                nom: 'Ciné',
                                                                                                                                                                                                titre: '',
                                                                                                                                                                                                action: function() { Utils.log_and_open_link( 'CCN', 'http://cine.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui' ); } },
                                                                                                                                                                                              { couleur: 'vert',
                                                                                                                                                                                                icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_cluemo.svg',
                                                                                                                                                                                                nom: 'Cluémo',
                                                                                                                                                                                                titre: '',
                                                                                                                                                                                                action: function() { Utils.log_and_open_link( 'CCN', 'http://cluemo.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui' ); } },
                                                                                                                                                                                              { couleur: 'rouge',
                                                                                                                                                                                                icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_etudiantsvoyageurs.svg',
                                                                                                                                                                                                nom: 'Etudiants voyageurs',
                                                                                                                                                                                                titre: '',
                                                                                                                                                                                                action: function() { Utils.log_and_open_link( 'CCN', 'http://etudiantsvoyageurs.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui' ); } },
                                                                                                                                                                                              { couleur: 'vert',
                                                                                                                                                                                                icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_finisterrae.svg',
                                                                                                                                                                                                nom: 'Finisterrae',
                                                                                                                                                                                                titre: '',
                                                                                                                                                                                                action: function() { Utils.log_and_open_link( 'CCN', 'http://finisterrae.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui' ); } },
                                                                                                                                                                                              { couleur: 'gris4',
                                                                                                                                                                                                icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_dechetmatiere.svg',
                                                                                                                                                                                                nom: 'Le déchet matière',
                                                                                                                                                                                                titre: '',
                                                                                                                                                                                                action: function() { Utils.log_and_open_link( 'CCN', 'http://ledechetmatiere.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui' ); } },
                                                                                                                                                                                              { couleur: 'violet',
                                                                                                                                                                                                icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_maisondeladanse.svg',
                                                                                                                                                                                                nom: 'Maison de la danse',
                                                                                                                                                                                                titre: '',
                                                                                                                                                                                                action: function() { Utils.log_and_open_link( 'CCN', 'http://maisondeladanse.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui' ); } },
                                                                                                                                                                                              { couleur: 'bleu',
                                                                                                                                                                                                icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_musique.svg',
                                                                                                                                                                                                nom: 'Musique',
                                                                                                                                                                                                titre: '',
                                                                                                                                                                                                action: function() { Utils.log_and_open_link( 'CCN', 'http://musique.laclasse.com/' ); } },
                                                                                                                                                                                              { couleur: 'jaune',
                                                                                                                                                                                                icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_science.svg',
                                                                                                                                                                                                nom: 'Science',
                                                                                                                                                                                                titre: '',
                                                                                                                                                                                                action: function() { Utils.log_and_open_link( 'CCN', 'http://science.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui' ); } },
                                                                                                                                                                                              { couleur: 'orange',
                                                                                                                                                                                                icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_picture.svg',
                                                                                                                                                                                                nom: 'Picture',
                                                                                                                                                                                                titre: '',
                                                                                                                                                                                                action: function() { Utils.log_and_open_link( 'CCN', 'http://picture.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui' ); } } ] ) ) };
                                                                                                                        } }
                                                                                                 ] ) ) };

                               $scope.root = $scope.tree;
                           } );
                   }
                 ]
               );
