'use strict';

angular.module( 'portailApp' )
    .component( 'appWrapper',
                { bindings: { appId: '<' },
                  controller: [ '$stateParams', '$sce', 'currentUser', 'Annuaire', 'Tiles', 'Utils',
                                function( $stateParams, $sce, currentUser, Annuaire, Tiles, Utils ) {
                                    var ctrl = this;

                                    ctrl.$onInit = function() {
                                        currentUser.get( true )
                                            .then( function( user ) {
                                                ctrl.user = user;
                                                var apps_list;

                                                if ( _(ctrl.user.profiles).isEmpty() ) {
                                                    apps_list = Annuaire.query_applications();
                                                } else {
                                                    apps_list = Tiles.query({ structure_id: ctrl.user.active_profile().structure_id }).$promise;
                                                }

                                                apps_list.then( function ( response ) {
                                                    ctrl.app = _(response).findWhere( { application_id: ctrl.appId } );

                                                    if ( _(ctrl.app).isUndefined() ) {
                                                        Utils.go_home();
                                                    }

                                                    ctrl.app.url = $sce.trustAsResourceUrl( ctrl.app.url );
                                                } );
                                            } );
                                    };
                                }
                              ],
                  template: `
<div id="app-wrapper">
    <div class="en-tete container gris4" role="navigation">
        <logo class="petit logolaclasse gris4 pull-left"
              user="$ctrl.user"></logo>

        <span class="hidden-xs hidden-sm titre" ng:cloak>{{$ctrl.app.name}}</span>

        <profilactif class="gris4 profil-select-wrapper"
                     ng:if="$ctrl.user.profiles"
                     user="$ctrl.user"></profilactif>
    </div>

    <appiframe url="$ctrl.app.url"
               class="appiframe"></appiframe>
</div>
`
                } );
