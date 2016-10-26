'use strict';

angular.module( 'portailApp' )
    .component( 'usermenu',
                { bindings: { user: '<' },
                  template: '<div class="dropdown hidden-xs hidden-sm hidden-md pull-right user-menu" uib-dropdown>' +
                  '            <a class="dropdown-toggle" id="dropdownMenu1" uib-dropdown-toggle>' +
                  '                {{$ctrl.user.prenom}} {{$ctrl.user.nom}}' +
                  '            </a>' +
                  '            <ul class="gris3 dropdown-menu" role="menu" aria-labelledby="dropdownMenu1" uib-dropdown-menu>' +
                  '                <li>' +
                  '                    <a ng:click="$ctrl.go_home()"' +
                  '                       ng:style="{\'background-image\': \'url(\' + $ctrl.prefix +\'/node_modules/laclasse-common-client/images/logolaclasse.svg)\' }" >' +
                  '                        retour au portail' +
                  '                    </a>' +
                  '                </li>' +
                  '                <!-- <li>' +
                  '                     <a data-ui-sref="app({ appid: \'aide\' })"' +
                  '                     ng:style="{\'background-image\': \'url(\' + $ctrl.prefix + \'/node_modules/laclasse-common-client/images/12_aide.svg)\' }" >' +
                  '                     aide' +
                  '                     </a>' +
                  '                     </li> -->' +
                  '                <li>' +
                  '                    <a ng:href="{{$ctrl.prefix}}/logout"' +
                  '                       ng:style="{\'background-image\': \'url(\' + $ctrl.prefix + \'/node_modules/laclasse-common-client/images/12_aide.svg)\' }" >' +
                  '                        se déconnecter' +
                  '                    </a>' +
                  '                </li>' +
                  '            </ul>' +
                  '        </div>',
                  controller: [ 'Utils', 'APP_PATH',
                                function( Utils, APP_PATH ) {
                                    this.prefix = APP_PATH;

                                    this.go_home = function() {
                                        Utils.go_home();
                                    };
                                } ]
                } );