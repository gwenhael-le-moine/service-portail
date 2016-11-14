'use strict';

angular.module( 'portailApp' )
    .component( 'usertile',
                { bindings: { user: '=' },
                  template: '<div class="col-xs-11 col-sm-11 col-md-6 col-lg-6 user"' +
                  '             ng:style="{ \'background-image\': \'url(\' + $ctrl.user.avatar + \')\' }">' +
                  '            <div class="user-info-bg">' +
                  '                <span class="user-info">' +
                  '                    <a href ng:click="$ctrl.edit_profile()" style="text-decoration: none;">' +
                  '                        <h4 class="hidden-xs hidden-sm full-name">{{$ctrl.user.prenom}} {{$ctrl.user.nom}}</h4>' +
                  '                        <h4 class="hidden-md hidden-lg initiales">{{$ctrl.user.prenom[0]}}{{$ctrl.user.nom[0]}}</h4>' +
                  '                    </a>' +
                  '                    <profilactif class="gris4" ng:if="$ctrl.user.has_profil"' +
                  '                                 user="$ctrl.user"></profilactif>' +
                  '                    <a class="btn hidden-xs hidden-sm logout" ng:href="{{$ctrl.prefix}}/logout" title="Déconnexion de Laclasse.com">se déconnecter</a>' +
                  '                </span>' +
                  '            </div>' +
                  '        </div>',
                  controller: [ 'APP_PATH',
                                function( APP_PATH ) {
                                    var ctrl = this;

                                    ctrl.prefix = APP_PATH;

                                    ctrl.edit_profile = function() {
                                        ctrl.user.edit_profile = true;
                                    };
                                } ]
                } );
