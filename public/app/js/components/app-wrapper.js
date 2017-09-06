'use strict';

angular.module( 'portailApp' )
    .component( 'appWrapper',
                { bindings: { appId: '<' },
                  controller: [ '$stateParams', 'currentUser',
                                function( $stateParams, currentUser ) {
                                    var ctrl = this;

                                    ctrl.$onInit = function() {
                                        currentUser.get( true )
                                            .then( function( user ) {
                                                ctrl.user = user;
                                            } );
                                    };
                                }
                              ],
                  template: `
<div id="app-wrapper">
    <div class="en-tete container gris4" role="navigation">
        <logo class="petit logolaclasse gris4 pull-left"
              user="$ctrl.user"></logo>

        <span class="hidden-xs hidden-sm titre" ng:cloak>{{app.nom}}</span>

        <usermenu user="$ctrl.user"></usermenu>

        <profilactif class="gris4 profil-select-wrapper"
                     ng:if="$ctrl.user.profiles"
                     user="$ctrl.user"></profilactif>
    </div>

    <appiframe appid="$ctrl.appId"
               user="$ctrl.user"
               class="appiframe"></appiframe>
</div>
`
                } );
