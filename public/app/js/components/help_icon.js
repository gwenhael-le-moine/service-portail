'use strict';

angular.module( 'portailApp' )
    .component( 'helpicon',
                { template: '<div uib-dropdown keyboard-nav ng:if="$ctrl.help_links.length > 0">' +
                  '            <a class="uib-dropdown-toggle" uib-dropdown-toggle><h2>?</h2> </a>' +
                  '            <ul class="dropdown-menu" uib-dropdown-menu role="menu" aria-labelledby="simple-btn-keyboard-nav">' +
                  '                <li ng:repeat="link in $ctrl.help_links">' +
                  '                    <a ng:href="{{link.url}}" target="_blank">{{link.title}}</a>' +
                  '                </li>' +
                  '            </ul>' +
                  '        </div>',
                  controller: [ 'currentUser',
                                function( currentUser ) {
                                    var ctrl = this;

                                    currentUser.help_links().then( function( response ) {
                                        ctrl.help_links = response;
                                    } );
                                } ]
                } );
