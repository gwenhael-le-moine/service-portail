'use strict';

angular.module( 'portailApp' )
    .component( 'helpicon',
                { bindings: { user: '<' },
                  template: '<div uib-dropdown keyboard-nav ng:if="$ctrl.help_links.length > 0">' +
                  '            <a class="uib-dropdown-toggle" uib-dropdown-toggle><h2>?</h2> </a>' +
                  '            <ul class="dropdown-menu" uib-dropdown-menu role="menu" aria-labelledby="simple-btn-keyboard-nav">' +
                  '                <li ng:repeat="link in $ctrl.help_links">' +
                  '                    <a ng:href="{{link.url}}" target="_blank">{{link.title}}</a>' +
                  '                </li>' +
                  '            </ul>' +
                  '        </div>',
                  controller: [ 'CONFIG',
                                function( CONFIG ) {
                                    let ctrl = this;

                                    ctrl.$onInit = function() {
                                        ctrl.help_links = _(CONFIG.help_links)
                                            .select( function( link ) {
                                                return !_(ctrl.user.profils).isEmpty() && _(link.profils).includes( ctrl.user.profil_actif.profil_id );
                                            } );
                                    };
                                } ]
                } );
