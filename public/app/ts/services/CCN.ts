'use strict';

angular.module('portailApp')
  .service('CCN',
  ['Utils', 'currentUser',
    function(Utils, currentUser) {
      var service = this;

      service.query = function() {
        var ccns = [{
          nom: '14-18',
          description: '14-18',
          icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_14-18.svg',
          color: 'jaune',
          action: function() { Utils.log_and_open_link('CCN', 'http://14-18.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui'); }
        },
        {
          nom: 'Zérogaspi',
          description: 'Zérogaspi',
          icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_zero-gaspi.svg',
          color: 'bleu',
          action: function() { Utils.log_and_open_link('CCN', 'http://zerogaspi.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui'); }
        },
        {
          nom: 'AIR',
          description: 'Assises du Roman',
          icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_air-2014.svg',
          color: 'jaune',
          action: function() { Utils.log_and_open_link('CCN', 'http://air.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui'); }
        },
        {
          nom: 'Habiter',
          description: 'Représentations cartographiques de l\'espace vécu',
          icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_habiter.svg',
          color: 'vert',
          action: function() { Utils.log_and_open_link('CCN', 'http://habiter.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui'); }
        },
        {
          nom: 'Code',
          description: 'Mener un projet de code créatif avec sa classe et réaliser un jeu en réseau',
          icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_code.svg',
          color: 'orange-brillant',
          action: function() { Utils.log_and_open_link('CCN', 'http://code.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui'); }
        },
        {
          nom: 'Polar / Krimi',
          description: 'Ecrire un roman illustré franco-allemand avec un auteur de polar et un illustrateur, en collaboration avec des collégiens allemands',
          icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_krimi.svg',
          color: 'bleu-fonce',
          action: function() { Utils.log_and_open_link('CCN', 'http://krimi.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui'); }
        },
        {
          nom: 'Projets archivés',
          description: 'Projets archivés',
          icon: '/app/node_modules/laclasse-common-client/images/06_thematiques.svg',
          color: 'gris1',
          leaves: [{
            nom: 'Théâtre',
            description: 'Théâtre',
            icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_theatre.svg',
            color: 'rouge',
            action: function() { Utils.log_and_open_link('CCN', 'http://theatre.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui'); }
          },
          // {
          //   nom: 'Philo',
          //   description: 'Philo',
          //   action: function() { Utils.log_and_open_link( 'CCN', 'http://philo.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui' ); },
          //   icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_philo.svg',
          //   color: 'violet'
          // },
          // {
          //   color: 'gris2',
          //   icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_miam.svg',
          //   nom: 'Miam',
          //   titre: '',
          //   action: function() { Utils.log_and_open_link( 'CCN', 'http://miam.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui' ); }
          // },
          // {
          //   color: 'bleu',
          //   icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_odysseespatiale.svg',
          //   nom: 'Odyssée spatiale',
          //   titre: '',
          //   action: function() { Utils.log_and_open_link( 'CCN', 'http://novaterra.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui' ); }
          // },
          // {
          //   color: 'jaune',
          //   icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_archeologie.svg',
          //   nom: 'Archéologie',
          //   titre: '',
          //   action: function() { Utils.log_and_open_link( 'CCN', 'http://archeologies.laclasse.com/' ); }
          // },
          {
            color: 'orange',
            icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_bd.svg',
            nom: 'BD',
            titre: '',
            action: function() { Utils.log_and_open_link('CCN', 'http://bd.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui'); }
          },
          {
            color: 'violet',
            icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_cine.svg',
            nom: 'Ciné',
            titre: '',
            action: function() { Utils.log_and_open_link('CCN', 'http://cine.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui'); }
          },
          {
            color: 'vert',
            icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_cluemo.svg',
            nom: 'Cluémo',
            titre: '',
            action: function() { Utils.log_and_open_link('CCN', 'http://cluemo.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui'); }
          },
          {
            color: 'rouge',
            icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_etudiantsvoyageurs.svg',
            nom: 'Etudiants voyageurs',
            titre: '',
            action: function() { Utils.log_and_open_link('CCN', 'http://etudiantsvoyageurs.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui'); }
          },
          {
            color: 'vert',
            icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_finisterrae.svg',
            nom: 'Finisterrae',
            titre: '',
            action: function() { Utils.log_and_open_link('CCN', 'http://finisterrae.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui'); }
          },
          {
            color: 'gris4',
            icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_dechetmatiere.svg',
            nom: 'Le déchet matière',
            titre: '',
            action: function() { Utils.log_and_open_link('CCN', 'http://ledechetmatiere.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui'); }
          },
          {
            color: 'violet',
            icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_maisondeladanse.svg',
            nom: 'Maison de la danse',
            titre: '',
            action: function() { Utils.log_and_open_link('CCN', 'http://maisondeladanse.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui'); }
          },
          {
            color: 'bleu',
            icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_musique.svg',
            nom: 'Musique',
            titre: '',
            action: function() { Utils.log_and_open_link('CCN', 'http://musique.laclasse.com/'); }
          },
          {
            color: 'jaune',
            icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_science.svg',
            nom: 'Science',
            titre: '',
            action: function() { Utils.log_and_open_link('CCN', 'http://science.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui'); }
          },
          {
            color: 'orange',
            icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_picture.svg',
            nom: 'Picture',
            titre: '',
            action: function() { Utils.log_and_open_link('CCN', 'http://picture.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui'); }
          }]
        }];

        currentUser.get(false)
          .then(function(user) {
            if (['DIR', 'ENS', 'DOC'].includes(user.active_profile().type)) {
              ccns.push({
                nom: 'Projets 2017-2018',
                description: '',
                icon: '/app/node_modules/laclasse-common-client/images/06_thematiques.svg',
                color: 'bleu-plus',
                action: function() { Utils.log_and_open_link('inscription_CCN', 'https://www.laclasse.com/portail/inscription_CCN/index.html'); }
              });
            }
          });

        return ccns;
      };
    }
  ]);
