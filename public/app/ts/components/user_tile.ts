'use strict';

angular.module( 'portailApp' )
    .component( 'userTile',
                { bindings: { user: '<' },
                  controller: [ 'APP_PATH', 'URL_ENT',
                                function( APP_PATH, URL_ENT ) {
                                    var ctrl = this;

                                    ctrl.APP_PATH = APP_PATH;

                                    ctrl.change_password_message = 'Pensez à changer votre mot de passe...';

                                    ctrl.edit_profile = function() {
                                        ctrl.user.edit_profile = !ctrl.user.edit_profile;
                                    };

                                    ctrl.$onInit = function() {
                                        ctrl.url_avatar = URL_ENT + '/' + ctrl.user.avatar;
                                    };
                                } ],
                  template: `
<div class="col-xs-11 col-sm-11 col-md-6 col-lg-6 user"
     ng:style="{ 'background-image': 'url(' + $ctrl.url_avatar + ')' }">
    <div class="user-info-bg">
        <span class="user-info">
            <a href style="text-decoration: none;" ng:click="$ctrl.edit_profile()">
                <h4 class="hidden-xs hidden-sm full-name">{{$ctrl.user.firstname}} {{$ctrl.user.lastname}}
                    <sup ng:if="$ctrl.user.default_password"><span class="glyphicon glyphicon-alert default-password" aria-hidden="true" data-descr="{{$ctrl.change_password_message}}"></span></sup>
                </h4>
                <h4 class="hidden-md hidden-lg initiales">{{$ctrl.user.firstname[0]}}{{$ctrl.user.lastname[0]}}</h4>
            </a>
            <profilactif class="gris4"
                         ng:if="$ctrl.user.profiles"
                         user="$ctrl.user"></profilactif>
            <a class="btn hidden-xs hidden-sm logout" ng:href="/sso/logout" title="Déconnexion de Laclasse.com">se déconnecter</a>
        </span>
    </div>
</div>
`
                } );
