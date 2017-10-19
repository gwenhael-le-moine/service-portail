'use strict';

angular.module('portailApp')
  .component('userProfile',
  {
    bindings: { user: '=' },
    controller: ['toastr', 'currentUser', 'APP_PATH', 'Utils', 'User',
      function(toastr, currentUser, APP_PATH, Utils, User) {
        var ctrl = this;
        ctrl.dirty = {};
        ctrl.min_password_strength = 1;

        ctrl.prefix = APP_PATH;
        ctrl.groups = [{
          ouvert: true,
          enabled: true
        },
        {
          ouvert: true,
          enabled: true
        }];

        ctrl.password = {
          new1: '',
          new2: ''
        };

        ctrl.open_datepicker = function($event) {
          $event.preventDefault();
          $event.stopPropagation();
        };

        ctrl.mark_as_dirty = function(key) {
          ctrl.dirty[key] = true;
        };

        ctrl.filter_emails = function() {
          return function(email) {
            return (ctrl.user.active_profile().type !== 'TUT'
              || email.type !== 'Ent')
              && _(email.asdress.match(email.user_id)).isNull();
          };
        };

        ctrl.save = function() {
          if (!_(ctrl.dirty).isEmpty()) {
            let mod_user = {};
            let bad_password = false;

            _(ctrl.dirty).keys().forEach(function(key) {
              mod_user[key] = ctrl.user[key];
            });

            if (ctrl.dirty.password && !_(ctrl.password.new1).isEmpty() && ctrl.password.new1 === ctrl.password.new2 && ctrl.passwordStrength.score > ctrl.min_password_strength) {
              mod_user.password = ctrl.password.new1;
            } else {
              delete mod_user.password;
              bad_password = ctrl.dirty.password && (ctrl.password.new1 != ctrl.password.new2 || ctrl.passwordStrength.score <= ctrl.min_password_strength)
            }

            if (bad_password) {
              if (ctrl.password.new1 != ctrl.password.new2) {
                alert('Confirmation de mot de passe incorrecte.')
              } else if (ctrl.passwordStrength.score <= ctrl.min_password_strength) {
                alert('Mot de passe trop faible.')
              }
            } else if (!_(mod_user).isEmpty()) {
              User.update({ id: ctrl.user.id }, mod_user).$promise
                .then(function success(response) {
                  toastr.success('Mise à jour effectuée.');
                },
                function error(response) { });
            }
          }
        };

        ctrl.$onInit = function() {
          ctrl.user.editable = _(ctrl.user.aaf_jointure_id).isNull();

          ctrl.user.birthdate = new Date(ctrl.user.birthdate);
        };
      }],
                                                        template: `
                                                        <header>
                                                          <h3>Profil utilisateur</h3>
                                                          <h1>{{$ctrl.user.firstname}} {{$ctrl.user.lastname}}</h1>
                                                        </header>
                                                        <div class="form">
                                                          <form>
                                                            <div class="avatar-container form-group col-md-4 col-xs-12 pull-right">
                                                              <label>Avatar :</label>
                                                              <avatar></avatar>
                                                            </div>

                                                            <accordion close-others="false" class="col-md-8 col-xs-12 pull-left">

                                                              <accordion-group data-is-open="$ctrl.groups[ 0 ].ouvert" ng:if="$ctrl.groups[ 0 ].enabled">
                                                                <accordion-heading>
                                                                  <span class="glyphicon" ng:class="{'glyphicon-chevron-down': $ctrl.groups[ 0 ].ouvert, 'glyphicon-chevron-right': !$ctrl.groups[ 0 ].ouvert}"></span> Informations
                                                                </accordion-heading>
                                                                <div class="row">

                                                                  <div class="form-group col-md-6 col-xs-12">
                                                                    <label for="nom">Nom :</label>
                                                                    <input type="text"
                                                                           id="nom"
                                                                           class="form-control"
                                                                           ng:disabled="!$ctrl.user.editable"
                                                                           ng:change="$ctrl.mark_as_dirty( 'lastname' )"
                                                                           ng:model="$ctrl.user.lastname">
                                                                  </div>
                                                                  <div class="form-group col-md-6 col-xs-12">
                                                                    <label for="prenom">Prénom :</label>
                                                                    <input type="text"
                                                                           id="prenom"
                                                                           class="form-control"
                                                                           ng:disabled="!$ctrl.user.editable"
                                                                           ng:change="$ctrl.mark_as_dirty( 'firstname' )"
                                                                           ng:model="$ctrl.user.firstname">
                                                                  </div>
                                                                  <div class="form-group col-md-6 col-xs-12">
                                                                    <label for="datenaissance">Date de naissance :</label>
                                                                    <input type="text"
                                                                           id="date_naissance"
                                                                           class="form-control"
                                                                           disabled
                                                                           value="{{$ctrl.user.birthdate | amDateFormat: 'LL'}}"
                                                                           ng:if="!$ctrl.user.editable" />
                                                                    <div uib-dropdown
                                                                         id="datenaissance"
                                                                         class="dropdown form-control date-naissance"
                                                                         ng:if="$ctrl.user.editable">
                                                                      <a uib-dropdown-toggle
                                                                         class="dropdown-toggle"
                                                                         role="button"
                                                                         data-toggle="uib-dropdown"
                                                                         data-target="#"
                                                                         href>{{$ctrl.user.birthdate | amDateFormat: 'LL'}}</a>
                                                                      <div uib-dropdown-menu
                                                                           class="dropdown-menu"
                                                                           role="menu"
                                                                           ng:click="$event.stopImmediatePropagation()">
                                                                        <div uib-datepicker
                                                                             datepicker-options="datepicker_options"
                                                                             ng:disabled="!$ctrl.user.editable"
                                                                             ng:change="$ctrl.mark_as_dirty( 'birthdate' )"
                                                                             ng:model="$ctrl.user.birthdate"
                                                                             ng:required="true">
                                                                        </div>
                                                                      </div>
                                                                    </div>
                                                                  </div>
                                                                  <div class="form-group col-md-6 col-xs-12">
                                                                    <label for="adresse">Adresse :</label>
                                                                    <input type="text"
                                                                           id="adresse"
                                                                           class="form-control"
                                                                           ng:disabled="!$ctrl.user.editable"
                                                                           ng:change="$ctrl.mark_as_dirty( 'address' )"
                                                                           ng:model="$ctrl.user.address">
                                                                  </div>
                                                                  <div class="form-group col-md-6 col-xs-12">
                                                                    <label for="codepostal">Code postal :</label>
                                                                    <input type="text"
                                                                           id="codepostal"
                                                                           class="form-control"
                                                                           ng:disabled="!$ctrl.user.editable"
                                                                           ng:change="$ctrl.mark_as_dirty( 'zip_code' )"
                                                                           ng:model="$ctrl.user.zip_code">
                                                                  </div>
                                                                  <div class="form-group col-md-6 col-xs-12">
                                                                    <label for="ville">Ville :</label>
                                                                    <input type="text"
                                                                           id="ville"
                                                                           class="form-control"
                                                                           ng:disabled="!$ctrl.user.editable"
                                                                           ng:change="$ctrl.mark_as_dirty( 'city' )"
                                                                           ng:model="$ctrl.user.city">
                                                                  </div>

                                                                  <div class="form-group col-md-6 col-xs-12"
                                                                       ng:repeat="email in $ctrl.user.emails | orderBy:'primary':true | filter:filter_emails()">
                                                                    <label for="courriel">Courriel <span ng:if="email.primary">principal</span> :</label>
                                                                    <input type="text"
                                                                           id="courriel"
                                                                           class="form-control"
                                                                           ng:disabled="true"
                                                                           ng:model="email.address">
                                                                  </div>
                                                                </div>

                                                              </accordion-group>

                                                              <accordion-group data-is-open="$ctrl.groups[ 1 ].ouvert" ng:if="$ctrl.groups[ 1 ].enabled">
                                                                <accordion-heading>
                                                                  <span class="glyphicon" ng:class="{'glyphicon-chevron-down': $ctrl.groups[ 1 ].ouvert, 'glyphicon-chevron-right': !$ctrl.groups[ 1 ].ouvert}"></span> Mot de passe<span style="font-weight: bold; color: rgba(235,84,84,0.75)" ng:if="$ctrl.user.default_password">, pensez à le changer...</span>
                                                                </accordion-heading>
                                                                <div class="row">
                                                                  <div class="form-group col-md-6 col-xs-12">
                                                                    <label for="newpasswd1">Nouveau mot de passe :</label>
                                                                    <input type="password" class="form-control" id="newpasswd1"
                                                                           ng:change="$ctrl.mark_as_dirty( 'password' )"
                                                                           ng:model="$ctrl.password.new1"
                                                                           zxcvbn="$ctrl.passwordStrength"
                                                                           zx-min-score="$ctrl.min_password_strength">
                                                                    <div class="password-strength"
                                                                         ng:if="$ctrl.dirty.password && $ctrl.password.new1 !== ''">
                                                                      <label>Qualité du mot de passe :</label>
                                                                      <uib-progressbar style="margin-bottom: 0;" max="5" value="$ctrl.passwordStrength.score + 1"
                                                                                       type="{{ ( $ctrl.passwordStrength.score < 2 ) ? 'danger' : ( ( $ctrl.passwordStrength.score < 3 ) ? 'warning' : ( ( $ctrl.passwordStrength.score < 4 ) ? 'primary' : 'success' ) ) }}">
                                                                        <span ng:switch="$ctrl.passwordStrength.score">
                                                                          <span style="color:white; white-space:nowrap;" ng:switch-when="0">Trop faible</span>
                                                                          <span style="color:white; white-space:nowrap;" ng:switch-when="1">Faible</span>
                                                                          <span style="color:white; white-space:nowrap;" ng:switch-when="2">Moyen</span>
                                                                          <span style="color:white; white-space:nowrap;" ng:switch-when="3">Bon</span>
                                                                          <span style="color:white; white-space:nowrap;" ng:switch-when="4">Excellent</span>
                                                                        </span>
                                                                      </uib-progressbar>
                                                                      <uib-progressbar max="5" value="$ctrl.min_password_strength + 1"
                                                                                       type="primary">
                                                                        <span style="color:white; white-space:nowrap;">Minimum accépté</span>
                                                                      </uib-progressbar>
                                                                    </div>
                                                                  </div>
                                                                  <div class="form-group col-md-6 col-xs-12"
                                                                       ng:class="{'has-error': $ctrl.password.new1 !== $ctrl.password.new2 }">
                                                                    <label for="newpasswd2">Confirmer le nouveau mot de passe :</label>
                                                                    <input type="password" class="form-control" id="newpasswd2"
                                                                           ng:model="$ctrl.password.new2">
                                                                  </div>
                                                                </div>
                                                              </accordion-group>

                                                              <footer>
                                                                <button ng:click="$ctrl.save()">Enregistrer</button>
                                                              </footer>
                                                            </accordion>
                                                          </form>
                                                        </div>
`
  });
