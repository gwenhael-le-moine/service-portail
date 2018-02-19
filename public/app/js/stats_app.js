'use strict';
angular.module('statsApp', ['ui.bootstrap',
    'nvd3',
    'angularMoment'])
    .run(['amMoment', function (amMoment) { amMoment.changeLocale('fr'); }])
    .config(['$httpProvider', function (provider) { provider.defaults.withCredentials = true; }])
    .component('stats', {
    controller: ['$http', '$locale', 'moment', 'URL_ENT',
        function ($http, $locale, moment, URL_ENT) {
            var ctrl = this;
            ctrl.allowed = false;
            $http.get(URL_ENT + '/api/users/current')
                .then(function success(response) {
                ctrl.allowed = _.chain(response.data.profiles)
                    .pluck('type')
                    .intersection(['DIR', 'ADM'])
                    .value().length > 0;
                if (!ctrl.allowed) {
                    return;
                }
                ctrl.types_labels = {
                    global: 'Statistiques globales',
                    structure_id: 'Établissements',
                    application_id: 'Tuiles',
                    profil_id: 'Profils utilisateurs',
                    user_id: 'Utilisateurs',
                    week_day: 'Jour de la semaine'
                };
                ctrl.period_types = {
                    list: [{ label: 'jour', value: 'day' },
                        { label: 'semaine', value: 'week' },
                        { label: 'mois', value: 'month' },
                        { label: 'année', value: 'year' }],
                    selected: 'week'
                };
                ctrl.multibarchart_options = {
                    chart: {
                        type: 'multiBarChart',
                        height: 256,
                        width: 1050,
                        margin: {
                            left: 50,
                            top: 20,
                            bottom: 100,
                            right: 20
                        },
                        showControls: false,
                        showValues: true,
                        showLegend: true,
                        stacked: false,
                        duration: 500,
                        labelThreshold: 0.01,
                        labelSunbeamLayout: true,
                        rotateLabels: -25,
                        reduceXTicks: false
                    }
                };
                ctrl.multibarhorizontalchart_options = angular.copy(ctrl.multibarchart_options);
                ctrl.multibarhorizontalchart_options.chart.type = 'multiBarHorizontalChart';
                ctrl.multibarhorizontalchart_options.chart.height = 512;
                ctrl.multibarhorizontalchart_options.chart.margin = {
                    left: 250,
                    top: 20,
                    bottom: 20,
                    right: 50
                };
                ctrl.chart_options = function (type, data) {
                    switch (type) {
                        case 'structure_id':
                        case 'profil_id':
                            ctrl.multibarhorizontalchart_options.chart.height = 24 * data.length * data[0].values.length + 40;
                            ctrl.multibarhorizontalchart_options.chart.margin.left = _.chain(data[0].values).pluck('x').map(function (label) { return label.length; }).max().value() * 8;
                            return ctrl.multibarhorizontalchart_options;
                        default:
                            return ctrl.multibarchart_options;
                    }
                };
                ctrl.retrieve_data = function (from) {
                    var started_at = moment();
                    ctrl.fin = ctrl.debut.clone().endOf(ctrl.period_types.selected);
                    ctrl.labels = {};
                    ctrl.labels.week_day = angular.copy($locale.DATETIME_FORMATS.DAY);
                    ctrl.labels.week_day.push(ctrl.labels.week_day.shift());
                    $http.get(URL_ENT + '/api/profiles_types')
                        .then(function (response) {
                        ctrl.labels.profil_id = _.chain(response.data).map(function (profil) { return [profil.id, profil.name]; }).object().value();
                    });
                    $http.get(URL_ENT + '/api/applications')
                        .then(function (response) {
                        ctrl.labels.application_id = _.chain(response.data).map(function (app) { return [app.id, app.name]; }).object().value();
                    });
                    $http.get(URL_ENT + '/api/structures_types')
                        .then(function (response) {
                        ctrl.structures_types = response.data;
                    });
                    $http.get(URL_ENT + '/api/structures', { params: { expand: false } })
                        .then(function (response) {
                        ctrl.labels.structure_id = _.chain(response.data).map(function (etab) { return [etab.id, etab.name + ' (' + etab.id + ')']; }).object().value();
                        $http.get(URL_ENT + '/api/logs', {
                            params: {
                                'timestamp>': ctrl.debut.clone().toDate(),
                                'timestamp<': ctrl.fin.clone().toDate(),
                                "structure_id[]": _.chain(ctrl.labels.structure_id)
                                    .keys()
                                    .reject(function (structure_id) {
                                    var ignored_structure_id = _(['0699990Z', '069BACAS', '069DANEZ']);
                                    return ignored_structure_id.contains(structure_id);
                                })
                                    .value()
                            }
                        })
                            .then(function (response) {
                            var keys = ['structure_id', 'application_id', 'profil_id', 'week_day'];
                            var stats_to_nvd3_data = function (key, values) {
                                var data = [{
                                        key: key,
                                        values: _.chain(values).keys().map(function (subkey) {
                                            return {
                                                key: key,
                                                value: subkey,
                                                x: ctrl.labels[key][subkey],
                                                y: values[subkey]
                                            };
                                        })
                                            .sortBy(function (record) {
                                            switch (key) {
                                                case 'structure_id':
                                                case 'profil_id':
                                                    return record.y * -1;
                                                case 'week_day':
                                                    return true;
                                                default:
                                                    return record.x;
                                            }
                                        })
                                            .value()
                                    }];
                                return data;
                            };
                            var extract_stats = function (logs, keys) {
                                return _.chain(keys)
                                    .map(function (key) {
                                    return [key, stats_to_nvd3_data(key, _(logs).countBy(key))];
                                })
                                    .object()
                                    .value();
                            };
                            ctrl.logs = response.data;
                            ctrl.filters = {};
                            ctrl.stats = {};
                            ctrl.stats.global = extract_stats(ctrl.logs, keys);
                            keys.forEach(function (key) {
                                if (key !== 'week_day') {
                                    ctrl.stats[key] = _.chain(ctrl.stats.global[key][0].values)
                                        .pluck('value')
                                        .map(function (value) {
                                        return [value, extract_stats(_(ctrl.logs).select(function (logline) { return logline[key] === value; }), _(keys).difference([key]))];
                                    })
                                        .object()
                                        .value();
                                }
                            });
                            ctrl.stats.global.structure_id.push({
                                key: 'utilisateurs uniques',
                                values: _.chain(ctrl.logs)
                                    .groupBy(function (line) { return line.structure_id; })
                                    .map(function (loglines, structure_id) {
                                    return {
                                        key: 'utilisateurs uniques',
                                        x: ctrl.labels.structure_id[structure_id],
                                        y: _.chain(loglines).pluck('user_id').uniq().value().length
                                    };
                                }).value()
                            });
                            ctrl.stats.global.structure_id.push({
                                key: 'apps',
                                values: _.chain(ctrl.logs)
                                    .groupBy(function (line) { return line.structure_id; })
                                    .map(function (loglines, structure_id) {
                                    return {
                                        key: 'apps',
                                        x: ctrl.labels.structure_id[structure_id],
                                        y: _.chain(loglines).pluck('application_id').uniq().value().length
                                    };
                                }).value()
                            });
                            ctrl.stats.global.profil_id.push({
                                key: 'utilisateurs uniques',
                                values: _.chain(ctrl.logs)
                                    .groupBy(function (line) { return line.profil_id; })
                                    .map(function (loglines, profil_id) {
                                    return {
                                        key: 'utilisateurs uniques',
                                        x: ctrl.labels.profil_id[profil_id],
                                        y: _.chain(loglines).pluck('user_id').uniq().value().length
                                    };
                                }).value()
                            });
                            _(ctrl.stats.structure_id).each(function (etab, structure_id) {
                                etab.profil_id.push({
                                    key: 'utilisateurs uniques',
                                    values: _.chain(ctrl.logs)
                                        .where({ structure_id: structure_id })
                                        .groupBy(function (line) { return line.profil_id; })
                                        .map(function (loglines, profil_id) {
                                        return {
                                            key: 'utilisateurs uniques',
                                            x: ctrl.labels.profil_id[profil_id],
                                            y: _.chain(loglines).pluck('user_id').uniq().value().length
                                        };
                                    }).value()
                                });
                            });
                        });
                    });
                };
                ctrl.decr_period = function () {
                    ctrl.debut.subtract(1, ctrl.period_types.selected + 's');
                    ctrl.retrieve_data(ctrl.debut);
                };
                ctrl.incr_period = function () {
                    ctrl.debut.add(1, ctrl.period_types.selected + 's');
                    ctrl.retrieve_data(ctrl.debut);
                };
                ctrl.reset_period = function () {
                    ctrl.debut = moment().startOf(ctrl.period_types.selected);
                    ctrl.retrieve_data(ctrl.debut);
                };
                ctrl.reset_period();
            });
        }
    ],
    template: "\n                                      <div ng:if=\"$ctrl.allowed\">\n                                        <h2>\n                                          <select ng:options=\"period_type.value as period_type.label for period_type in $ctrl.period_types.list\"\n                                                  ng:model=\"$ctrl.period_types.selected\"\n                                                  ng:change=\"$ctrl.reset_period()\"></select>\n                                          <button class=\"btn btn-lg\" ng:click=\"$ctrl.reset_period()\"> \u2715 </button>\n                                          <button class=\"btn btn-lg\" ng:click=\"$ctrl.decr_period()\"> < </button>\n                                                                                                       <button class=\"btn btn-lg\" ng:click=\"$ctrl.incr_period()\"> > </button>\n                                          {{ $ctrl.debut | amDateFormat:'dddd Do MMMM YYYY' }} - {{ $ctrl.fin | amDateFormat:'dddd Do MMMM YYYY' }}\n                                        </h2>\n\n                                        <div class=\"col-md-12\"\n                                             ng:repeat=\"(type, values) in $ctrl.stats\">\n                                          <div class=\"panel panel-default\"\n                                               ng:if=\"type === 'global'\">\n                                            <div class=\"panel-heading\">{{$ctrl.types_labels[type]}}</div>\n                                            <div class=\"panel-body\">\n                                              <uib-tabset>\n                                                <uib-tab index=\"$index + 1\"\n                                                         ng:repeat=\"(key, stat) in values\"\n                                                         heading=\"{{stat[0].values.length}} {{$ctrl.types_labels[key]}}\">\n                                                  <nvd3 data=\"stat\"\n                                                        options=\"$ctrl.chart_options( key, stat )\">\n                                                  </nvd3>\n                                                </uib-tab>\n                                              </uib-tabset>\n                                            </div>\n                                          </div>\n\n                                          <div class=\"panel panel-default\"\n                                               ng:if=\"type !== 'global'\">\n                                            <div class=\"panel-heading\">Statistiques par {{$ctrl.types_labels[type]}}</div>\n                                            <div class=\"panel-body\">\n                                              <uib-tabset>\n                                                <uib-tab index=\"$index + 1\"\n                                                         ng:repeat=\"(key, value) in values\"\n                                                         heading=\"{{value[0].values.length}} {{$ctrl.labels[type][key]}}\">\n                                                  <uib-tabset>\n                                                    <uib-tab index=\"$index + 1\"\n                                                             ng:repeat=\"(subkey, stat) in value\"\n                                                             heading=\"{{stat[0].values.length}} {{$ctrl.types_labels[subkey]}}\">\n                                                      <nvd3 data=\"stat\"\n                                                            options=\"$ctrl.chart_options( subkey, stat )\">\n                                                      </nvd3>\n                                                    </uib-tab>\n                                                  </uib-tabset>\n                                                </uib-tab>\n                                              </uib-tabset>\n                                            </div>\n                                          </div>\n                                        </div>\n                                      </div>\n"
});
