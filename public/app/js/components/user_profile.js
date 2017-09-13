'use strict';
angular.module('portailApp')
    .component('userProfile', { bindings: { user: '=' },
    controller: ['toastr', 'currentUser', 'APP_PATH', 'Utils', 'User',
        function (toastr, currentUser, APP_PATH, Utils, User) {
            var ctrl = this;
            ctrl.dirty = {};
            ctrl.prefix = APP_PATH;
            ctrl.groups = [{ ouvert: true,
                    enabled: true },
                { ouvert: true,
                    enabled: true }];
            ctrl.password = { new1: '',
                new2: '' };
            ctrl.open_datepicker = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();
            };
            ctrl.mark_as_dirty = function (key) {
                ctrl.dirty[key] = true;
            };
            ctrl.filter_emails = function () {
                return function (email) {
                    return (ctrl.user.active_profile().type !== 'TUT'
                        || email.type !== 'Ent')
                        && _(email.asdress.match(email.user_id)).isNull();
                };
            };
            ctrl.save = function () {
                if (!_(ctrl.dirty).isEmpty()
                    && (_(ctrl.password.new1).isEmpty()
                        || (!_(ctrl.password.new1).isEmpty()
                            && (ctrl.password.new1 === ctrl.password.new2)))) {
                    var mod_user = {};
                    _(ctrl.dirty).keys().forEach(function (key) {
                        mod_user[key] = ctrl.user[key];
                    });
                    if (!_(ctrl.password.new1).isEmpty()) {
                        mod_user.password = ctrl.password.new1;
                    }
                    else {
                        delete mod_user.password;
                    }
                    if (!_(mod_user).isEmpty()) {
                        User.update({ id: ctrl.user.id }, mod_user).$promise
                            .then(function success(response) {
                            toastr.success('Mise à jour effectuée.');
                        }, function error(response) { });
                    }
                }
            };
            ctrl.$onInit = function () {
                ctrl.user.editable = _(ctrl.user.aaf_jointure_id).isNull();
                ctrl.user.birthdate = new Date(ctrl.user.birthdate);
            };
        }],
    template: "\n<header>\n    <h3>Profil utilisateur</h3>\n    <h1>{{$ctrl.user.firstname}} {{$ctrl.user.lastname}}</h1>\n</header>\n<div class=\"form\">\n    <form>\n        <div class=\"avatar-container form-group col-md-4 col-xs-12 pull-right\">\n            <label>Avatar :</label>\n            <avatar></avatar>\n        </div>\n\n        <accordion close-others=\"false\" class=\"col-md-8 col-xs-12 pull-left\">\n\n            <accordion-group data-is-open=\"$ctrl.groups[ 0 ].ouvert\" ng:if=\"$ctrl.groups[ 0 ].enabled\">\n                <accordion-heading>\n                    <span class=\"glyphicon\" ng:class=\"{'glyphicon-chevron-down': $ctrl.groups[ 0 ].ouvert, 'glyphicon-chevron-right': !$ctrl.groups[ 0 ].ouvert}\"></span> Informations\n                </accordion-heading>\n                <div class=\"row\">\n\n                    <div class=\"form-group col-md-6 col-xs-12\">\n                        <label for=\"nom\">Nom :</label>\n                        <input type=\"text\"\n                               id=\"nom\"\n                               class=\"form-control\"\n                               ng:disabled=\"!$ctrl.user.editable\"\n                               ng:change=\"$ctrl.mark_as_dirty( 'lastname' )\"\n                               ng:model=\"$ctrl.user.lastname\">\n                    </div>\n                    <div class=\"form-group col-md-6 col-xs-12\">\n                        <label for=\"prenom\">Pr\u00E9nom :</label>\n                        <input type=\"text\"\n                               id=\"prenom\"\n                               class=\"form-control\"\n                               ng:disabled=\"!$ctrl.user.editable\"\n                               ng:change=\"$ctrl.mark_as_dirty( 'firstname' )\"\n                               ng:model=\"$ctrl.user.firstname\">\n                    </div>\n                    <div class=\"form-group col-md-6 col-xs-12\">\n                        <label for=\"datenaissance\">Date de naissance :</label>\n                        <input type=\"text\"\n                               id=\"date_naissance\"\n                               class=\"form-control\"\n                               disabled\n                               value=\"{{$ctrl.user.birthdate | amDateFormat: 'LL'}}\"\n                               ng:if=\"!$ctrl.user.editable\" />\n                        <div uib-dropdown\n                             id=\"datenaissance\"\n                             class=\"dropdown form-control date-naissance\"\n                             ng:if=\"$ctrl.user.editable\">\n                            <a uib-dropdown-toggle\n                               class=\"dropdown-toggle\"\n                               role=\"button\"\n                               data-toggle=\"uib-dropdown\"\n                               data-target=\"#\"\n                               href>{{$ctrl.user.birthdate | amDateFormat: 'LL'}}</a>\n                            <div uib-dropdown-menu\n                                 class=\"dropdown-menu\"\n                                 role=\"menu\"\n                                 ng:click=\"$event.stopImmediatePropagation()\">\n                                <div uib-datepicker\n                                     datepicker-options=\"datepicker_options\"\n                                     ng:disabled=\"!$ctrl.user.editable\"\n                                     ng:change=\"$ctrl.mark_as_dirty( 'birthdate' )\"\n                                     ng:model=\"$ctrl.user.birthdate\"\n                                     ng:required=\"true\">\n                                </div>\n                            </div>\n                        </div>\n                    </div>\n                    <div class=\"form-group col-md-6 col-xs-12\">\n                        <label for=\"adresse\">Adresse :</label>\n                        <input type=\"text\"\n                               id=\"adresse\"\n                               class=\"form-control\"\n                               ng:disabled=\"!$ctrl.user.editable\"\n                               ng:change=\"$ctrl.mark_as_dirty( 'address' )\"\n                               ng:model=\"$ctrl.user.address\">\n                    </div>\n                    <div class=\"form-group col-md-6 col-xs-12\">\n                        <label for=\"codepostal\">Code postal :</label>\n                        <input type=\"text\"\n                               id=\"codepostal\"\n                               class=\"form-control\"\n                               ng:disabled=\"!$ctrl.user.editable\"\n                               ng:change=\"$ctrl.mark_as_dirty( 'zip_code' )\"\n                               ng:model=\"$ctrl.user.zip_code\">\n                    </div>\n                    <div class=\"form-group col-md-6 col-xs-12\">\n                        <label for=\"ville\">Ville :</label>\n                        <input type=\"text\"\n                               id=\"ville\"\n                               class=\"form-control\"\n                               ng:disabled=\"!$ctrl.user.editable\"\n                               ng:change=\"$ctrl.mark_as_dirty( 'city' )\"\n                               ng:model=\"$ctrl.user.city\">\n                    </div>\n\n                    <div class=\"form-group col-md-6 col-xs-12\"\n                         ng:repeat=\"email in $ctrl.user.emails | orderBy:'primary':true | filter:filter_emails()\">\n                        <label for=\"courriel\">Courriel <span ng:if=\"email.primary\">principal</span> :</label>\n                        <input type=\"text\"\n                               id=\"courriel\"\n                               class=\"form-control\"\n                               ng:disabled=\"true\"\n                               ng:model=\"email.address\">\n                    </div>\n                </div>\n\n            </accordion-group>\n\n            <accordion-group data-is-open=\"$ctrl.groups[ 1 ].ouvert\" ng:if=\"$ctrl.groups[ 1 ].enabled\">\n                <accordion-heading>\n                    <span class=\"glyphicon\" ng:class=\"{'glyphicon-chevron-down': $ctrl.groups[ 1 ].ouvert, 'glyphicon-chevron-right': !$ctrl.groups[ 1 ].ouvert}\"></span> Mot de passe<span style=\"font-weight: bold; color: rgba(235,84,84,0.75)\" ng:if=\"$ctrl.user.default_password\">, pensez \u00E0 le changer...</span>\n                </accordion-heading>\n                <div class=\"row\">\n                    <div class=\"form-group col-md-6 col-xs-12\">\n                        <label for=\"newpasswd1\">Nouveau mot de passe :</label>\n                        <input type=\"password\" class=\"form-control\" id=\"newpasswd1\"\n                               ng:change=\"$ctrl.mark_as_dirty( 'password' )\"\n                               ng:model=\"$ctrl.password.new1\"\n                               zxcvbn=\"passwordStrength\"\n                               zx-min-score=\"2\">\n                        <div class=\"password-strength\"\n                             ng:if=\"$ctrl.dirty.password && $ctrl.password.new1 !== ''\">\n                            <label>Qualit\u00E9 du mot de passe :</label>\n                            <uib-progressbar max=\"5\" value=\"passwordStrength.score + 1\"\n                                             type=\"{{ ( passwordStrength.score < 2 ) ? 'danger' : ( ( passwordStrength.score < 3 ) ? 'warning' : ( ( passwordStrength.score < 4 ) ? 'primary' : 'success' ) ) }}\">\n                                <span ng:switch=\"passwordStrength.score\">\n                                    <span style=\"color:white; white-space:nowrap;\" ng:switch-when=\"0\">Trop faible</span>\n                                    <span style=\"color:white; white-space:nowrap;\" ng:switch-when=\"1\">Faible</span>\n                                    <span style=\"color:white; white-space:nowrap;\" ng:switch-when=\"2\">Moyen</span>\n                                    <span style=\"color:white; white-space:nowrap;\" ng:switch-when=\"3\">Bon</span>\n                                    <span style=\"color:white; white-space:nowrap;\" ng:switch-when=\"4\">Excellent</span>\n                                </span>\n                            </uib-progressbar>\n                        </div>\n                    </div>\n                    <div class=\"form-group col-md-6 col-xs-12\"\n                         ng:class=\"{'has-error': $ctrl.password.new1 !== $ctrl.password.new2 }\">\n                        <label for=\"newpasswd2\">Confirmer le nouveau mot de passe :</label>\n                        <input type=\"password\" class=\"form-control\" id=\"newpasswd2\"\n                               ng:model=\"$ctrl.password.new2\">\n                    </div>\n                </div>\n            </accordion-group>\n\n            <footer>\n                <button ng:click=\"$ctrl.save()\">Enregistrer</button>\n            </footer>\n        </accordion>\n    </form>\n</div>\n"
});
