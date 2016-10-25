'use strict';

angular.module( 'portailApp' )
    .component( 'usertile',
                { bindings: { user: '<' },
                  template: '<div class="col-xs-11 col-sm-11 col-md-6 col-lg-6 user"' +
                  '             ng:style="{ \'background-image\': \'url(\' + $ctrl.user.avatar + \')\' }">' +
                  '            <div class="user-info-bg">' +
                  '                <span class="user-info">' +
                  '                    <a data-ui-sref="portail.user">' +
                  '                        <h4 class="hidden-xs hidden-sm full-name">{{$ctrl.user.prenom}} {{$ctrl.user.nom}}</h4>' +
                  '                        <h4 class="hidden-md hidden-lg initiales">{{$ctrl.user.prenom[0]}}{{$ctrl.user.nom[0]}}</h4>' +
                  '                    </a>' +
                  '                    <profilactif class="gris4"' +
                  '                                 user="$ctrl.user"></profilactif>' +
                  '                    <a class="btn hidden-xs hidden-sm logout" ng:href="{{$ctrl.prefix}}/logout" title="Déconnexion de Laclasse.com">se déconnecter</a>' +
                  '                </span>' +
                  '            </div>' +
                  '        </div>',
                  controller: [ 'APP_PATH',
                                function( APP_PATH ) {
                                    this.prefix = APP_PATH;
                                } ]
                } );
