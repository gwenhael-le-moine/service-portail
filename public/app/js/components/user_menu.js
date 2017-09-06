'use strict';

angular.module( 'portailApp' )
    .component( 'usermenu',
                { bindings: { user: '<' },
                  controller: [ 'Utils', 'APP_PATH',
                                function( Utils, APP_PATH ) {
                                    this.prefix = APP_PATH;

                                    this.go_home = function() {
                                        Utils.go_home();
                                    };
                                } ],
                  template: `
<div class="uib-dropdown hidden-xs hidden-sm hidden-md pull-right user-menu" uib-dropdown>
    <a class="uib-dropdown-toggle" id="dropdownMenu1" uib-dropdown-toggle>
        {{$ctrl.user.firstname}} {{$ctrl.user.lastname}}
    </a>
    <ul class="gris3 uib-dropdown-menu" role="menu" aria-labelledby="dropdownMenu1" uib-dropdown-menu>
        <li>
            <a ng:click="$ctrl.go_home()"
               ng:style="{'background-image': 'url(' + $ctrl.prefix +'/node_modules/laclasse-common-client/images/logolaclasse.svg)' }" >
                retour au portail
            </a>
        </li>
        <li>
            <a ng:href="{{$ctrl.prefix}}/logout"
               ng:style="{'background-image': 'url(' + $ctrl.prefix + '/node_modules/laclasse-common-client/images/12_aide.svg)' }" >
                se déconnecter
            </a>
        </li>
    </ul>
</div>
`
                } );
