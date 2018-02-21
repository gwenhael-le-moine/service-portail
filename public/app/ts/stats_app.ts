'use strict';

// Declare app level module which depends on filters, and services
angular.module('statsApp',
  [
    'ui.bootstrap',
    'nvd3',
    'angularMoment',
    'chieffancypants.loadingBar',
  ])
  .run(['amMoment', function(amMoment) { amMoment.changeLocale('fr'); }])
  .config(['$httpProvider', function(provider) { provider.defaults.withCredentials = true; }])
  .component('stats',
    {
      controller: ['$http', '$locale', '$q', 'moment', 'URL_ENT',
        function($http, $locale, $q, moment, URL_ENT) {
          let ctrl = this;
          ctrl.allowed = false;

          ctrl.period = {
            decr: function() {
              ctrl.debut.subtract(1, ctrl.period_types.selected + 's');
              ctrl.retrieve_data();
            },

            incr: function() {
              ctrl.debut.add(1, ctrl.period_types.selected + 's');
              ctrl.retrieve_data();
            },

            reset: function() {
              ctrl.debut = moment().startOf(ctrl.period_types.selected);
              ctrl.retrieve_data();
            }
          };

          ctrl.types_labels = {
            global: 'Statistiques globales',
            structure_id: 'Établissements',
            application_id: 'Tuiles',
            profil_id: 'Profils utilisateurs',
            user_id: 'Utilisateurs',
            weekday: 'Jours de la semaine',
            hour: 'Heures de la journée'
          };

          ctrl.period_types = {
            list: [
              { label: 'jour', value: 'day' },
              { label: 'semaine', value: 'week' },
              { label: 'mois', value: 'month' }
            ],
            selected: 'week'
          };

          ctrl.cities = {
            list: [],
            selected: undefined
          };

          ctrl.structures_types = {
            list: [],
            selected: undefined
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

          ctrl.chart_options = function(type, data) {
            switch (type) {
              case 'structure_id':
              case 'profil_id':
                ctrl.multibarhorizontalchart_options.chart.height = 24 * data.length * data[0].values.length + 40;
                ctrl.multibarhorizontalchart_options.chart.margin.left = _.chain(data[0].values).pluck('x').map(function(label) { return label.length; }).max().value() * 8;
                return ctrl.multibarhorizontalchart_options;
              default:
                return ctrl.multibarchart_options;
            }
          };

          ctrl.labels = {
            weekday: _.memoize((nb) => {
              let week_days = angular.copy($locale.DATETIME_FORMATS.DAY);
              week_days.push(week_days.shift());

              return week_days[nb];
            }),
            hour: (h) => `${h}h`
          };

          ctrl.process_data = function(data) {
            ctrl.logs = _(data).map((log) => {
              log.timestamp = moment(log.timestamp);

              log.weekday = log.timestamp.day();
              log.hour = log.timestamp.hour();

              return log;
            });
            ctrl.logs_SSO = _(ctrl.logs).where({ application_id: "SSO" });

            ctrl.totals = {
              users: _(ctrl.logs).countBy((log) => { return log.user_id; }),
              profile: _(ctrl.logs).countBy((log) => { return log.profil_id; }),
            }

            ctrl.logs = _(ctrl.logs).reject((logline) => { return logline.application_id == "SSO"; })

            console.log(ctrl.totals)

            ctrl.log_structures = _.chain(ctrl.logs).pluck("structure_id").uniq().map((structure_id) => _(ctrl.structures).findWhere({ id: structure_id })).value();
            ctrl.log_applications = _.chain(ctrl.logs).pluck("application_id").uniq().map((application_id) => _(ctrl.applications).findWhere({ id: application_id })).value();
            ctrl.log_profiles_types = _.chain(ctrl.logs).pluck("profil_id").uniq().map((profile_id) => _(ctrl.profiles_types).findWhere({ id: profile_id })).value();

            let keys = ['structure_id', 'application_id', 'profil_id', 'weekday', 'hour'];

            let stats_to_nvd3_data = function(key, values) {
              let data = [{
                key: "clicks",
                values: _.chain(values).keys().map(function(subkey) {
                  return {
                    key: key,
                    value: subkey,
                    x: ctrl.labels[key](subkey),
                    y: values[subkey]
                  };
                })
                  .sortBy(function(record) {
                    switch (key) {
                      case 'structure_id':
                      case 'profil_id':
                        return record.y * -1;
                      default:
                        return record.x;
                    }
                  })
                  .value()
              }];

              return data;
            };

            let extract_stats = function(logs, keys) {
              return _.chain(keys)
                .map(function(key) {
                  return [key, stats_to_nvd3_data(key, _(logs).countBy(key))];
                })
                .object()
                .value();
            };

            ctrl.stats = {};
            ctrl.stats.global = extract_stats(ctrl.logs, keys);

            ctrl.stats.global.structure_id.push({
              key: 'utilisateurs uniques',
              values: _.chain(ctrl.logs)
                .groupBy(function(line) { return line.structure_id; })
                .map(function(loglines, structure_id) {
                  return {
                    key: 'utilisateurs uniques',
                    x: ctrl.labels.structure_id(structure_id),
                    y: _.chain(loglines).pluck('user_id').uniq().value().length
                  };
                }).value()
            });
            ctrl.stats.global.structure_id.push({
              key: 'apps',
              values: _.chain(ctrl.logs)
                .groupBy(function(line) { return line.structure_id; })
                .map(function(loglines, structure_id) {
                  return {
                    key: 'apps',
                    x: ctrl.labels.structure_id(structure_id),
                    y: _.chain(loglines).pluck('application_id').uniq().value().length
                  };
                }).value()
            });
            ctrl.stats.global.profil_id.push({
              key: 'utilisateurs uniques',
              values: _.chain(ctrl.logs)
                .groupBy(function(line) { return line.profil_id; })
                .map(function(loglines, profil_id) {
                  return {
                    key: 'utilisateurs uniques',
                    x: ctrl.labels.profil_id(profil_id),
                    y: _.chain(loglines).pluck('user_id').uniq().value().length
                  };
                }).value()
            });

            keys.forEach(function(key) {
              ctrl.stats[key] = _.chain(ctrl.stats.global[key][0].values)
                .pluck('value')
                .map(function(value) {
                  return [value, extract_stats(_(ctrl.logs).select(function(logline) { return logline[key] === value; }),
                    _(keys).difference([key]))];
                })
                .object()
                .value();
            });

            _(ctrl.stats.structure_id).each(function(etab, structure_id) {
              etab.profil_id.push({
                key: 'utilisateurs uniques',
                values: _.chain(ctrl.logs)
                  .where({ structure_id: structure_id })
                  .groupBy(function(line) { return line.profil_id; })
                  .map(function(loglines, profil_id) {
                    return {
                      key: 'utilisateurs uniques',
                      x: ctrl.labels.profil_id(profil_id),
                      y: _.chain(loglines).pluck('user_id').uniq().value().length
                    };
                  }).value()
              });
            });
          };

          ctrl.filter_data = (data) => {
            return _(data)
              .select((logline) => {
                return (ctrl.structures_types.selected == undefined || _.chain(ctrl.structures).where({ type: ctrl.structures_types.selected.id }).pluck("id").contains(logline.structure_id).value()) &&
                  (ctrl.cities.selected == undefined || _.chain(ctrl.structures).where({ zip_code: ctrl.cities.selected.zip_code }).pluck("id").contains(logline.structure_id).value());
              });
          };

          ctrl.retrieve_data = function() {
            ctrl.fin = ctrl.debut.clone().endOf(ctrl.period_types.selected);

            $http.get(URL_ENT + '/api/logs', {
              params: {
                'timestamp>': ctrl.debut.clone().toDate(),
                'timestamp<': ctrl.fin.clone().toDate()
              }
            })
              .then(function(response) {
                ctrl.raw_logs = response.data;

                if (ctrl.raw_logs.length > 0) {
                  $http.get(URL_ENT + '/api/structures', { params: { expand: false, "id[]": _.chain(ctrl.raw_logs).pluck("structure_id").uniq().value() } })
                    .then(function(response) {
                      ctrl.structures = response.data;
                      ctrl.labels.structure_id = _.memoize((uai) => {
                        return `${_(ctrl.structures).findWhere({ id: uai }).name} (${uai})`;
                      });

                      ctrl.cities.list = _.chain(ctrl.structures).map((structure) => { return { zip_code: structure.zip_code, city: structure.city }; }).uniq((city) => city.zip_code).reject((city) => { return city.zip_code == null || city.zip_code == ""; }).value();

                      return $http.get(URL_ENT + '/api/structures_types', { params: { "id[]": _.chain(ctrl.structures).pluck("type").uniq().value() } });
                    })
                    .then(function(response) {
                      ctrl.structures_types.list = response.data;
                    })
                    .then(() => {
                      ctrl.process_data(ctrl.filter_data(ctrl.raw_logs));
                    });
                }
              });
          };

          $http.get(URL_ENT + '/api/users/current')
            .then(function success(response) {
              ctrl.allowed = _.chain(response.data.profiles)
                .pluck('type')
                .intersection(['DIR', 'ADM'])
                .value().length > 0;

              if (ctrl.allowed) {
                let promises = [
                  $http.get(URL_ENT + '/api/profiles_types')
                    .then(function(response) {
                      ctrl.profiles_types = response.data;
                      ctrl.labels.profil_id = _.memoize((profile_type) => {
                        return _(ctrl.profiles_types).findWhere({ id: profile_type }).name;
                      });
                    }),

                  $http.get(URL_ENT + '/api/applications')
                    .then(function(response) {
                      ctrl.applications = response.data;
                      ctrl.labels.application_id = _.memoize((application_id) => {
                        return _(ctrl.applications).findWhere({ id: application_id }).name;
                      });
                    })
                ];

                $q.all(promises)
                  .then((responses) => {
                    ctrl.period.reset();
                  })
              }
            });
        }
      ],
  template: `
  <div ng:if="$ctrl.allowed">
    <h2>
      {{ $ctrl.debut | amDateFormat:'dddd Do MMMM YYYY' }} - {{ $ctrl.fin | amDateFormat:'dddd Do MMMM YYYY' }}
    </h2>
    <h3>
      <select ng:options="period_type.value as period_type.label for period_type in $ctrl.period_types.list"
              ng:model="$ctrl.period_types.selected"
              ng:change="$ctrl.period.reset()"></select>
      <button class="btn btn-lg" ng:click="$ctrl.period.reset()"> ✕ </button>
      <button class="btn btn-lg" ng:click="$ctrl.period.decr()"> ◀ </button>
      <button class="btn btn-lg" ng:click="$ctrl.period.incr()"> ▶ </button>
    </h3>
    <h3>
      <select ng:options="city as city.zip_code + ' : ' + city.city for city in $ctrl.cities.list"
              ng:model="$ctrl.cities.selected"
              ng:change="$ctrl.process_data($ctrl.filter_data($ctrl.raw_logs));"></select>
      <select ng:options="st as st.name for st in $ctrl.structures_types.list"
              ng:model="$ctrl.structures_types.selected"
              ng:change="$ctrl.process_data($ctrl.filter_data($ctrl.raw_logs));"></select>
    </h3>

    <div class="col-md-12"
         ng:repeat="(type, values) in $ctrl.stats">
      <div class="panel panel-default"
           ng:if="type == 'global'">
        <div class="panel-heading">{{$ctrl.types_labels[type]}} {{$ctrl.logs_SSO.length}} connexions</div>
        <div class="panel-body">
          <uib-tabset>
            <uib-tab index="$index + 1"
                     ng:repeat="(key, stat) in values"
                     heading="{{stat[0].values.length}} {{$ctrl.types_labels[key]}}">
              <nvd3 data="stat"
                    options="$ctrl.chart_options( key, stat )">
              </nvd3>
            </uib-tab>
          </uib-tabset>
        </div>
      </div>

      <div class="panel panel-default"
           ng:if="type !== 'global'">
        <div class="panel-heading">Statistiques par {{$ctrl.types_labels[type]}}</div>
        <div class="panel-body">
          <uib-tabset>
            <uib-tab index="$index + 1"
                     ng:repeat="(key, value) in values"
                     heading="{{value[0].values.length}} {{$ctrl.labels[type](key)}}">
              <uib-tabset>
                <uib-tab index="$index + 1"
                         ng:repeat="(subkey, stat) in value"
                         heading="{{stat[0].values.length}} {{$ctrl.types_labels[subkey]}}">
                  <nvd3 data="stat"
                        options="$ctrl.chart_options( subkey, stat )">
                  </nvd3>
                </uib-tab>
              </uib-tabset>
            </uib-tab>
          </uib-tabset>
        </div>
      </div>
    </div>
  </div>
`
    });
