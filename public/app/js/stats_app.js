'use strict';

// Declare app level module which depends on filters, and services
angular.module( 'statsApp',
                [ 'ui.bootstrap',
                  'nvd3',
                  'angularMoment' ] )
    .run( [ 'amMoment', function( amMoment ) { amMoment.changeLocale( 'fr' ); } ] )
    .config( [ '$httpProvider', function( provider ) { provider.defaults.withCredentials = true; } ] )
    .service( 'Annuaire',
              [ '$http', 'URL_ENT',
                function( $http, URL_ENT ) {
                    this.get_stats = function( params ) {
                        return $http.get( URL_ENT + '/api/logs', { params: params } );
                    };

                    this.get_profils = function( params ) {
                        return $http.get( URL_ENT + '/api/profiles_types', { params: params } );
                    };

                    this.get_structures = function( params ) {
                        params.expand = false;
                        return $http.get( URL_ENT + '/api/structures', { params: params } );
                    };

                    this.get_applications = function( params ) {
                        return $http.get( URL_ENT + '/api/applications', { params: params } );
                    };
                }
              ] )
    .controller( 'StatsCtrl',
                 [ '$scope', '$http', '$locale', 'moment', 'Annuaire',
                   function ( $scope, $http, $locale, moment, Annuaire ) {
                       $scope.types_labels = { global: 'Statistiques globales',
                                               structure_id: 'Établissements',
                                               application_id: 'Tuiles',
                                               profil_id: 'Profils utilisateurs',
                                               user_id: 'Utilisateurs',
                                               week_day: 'Jour de la semaine'};

                       $scope.period_types = { list: [ { label: 'jour', value: 'day' },
                                                       { label: 'semaine', value: 'week' },
                                                       { label: 'mois', value: 'month' },
                                                       { label: 'année', value: 'year' } ],
                                               selected: 'week' };

                       $scope.multibarchart_options = { chart: { type: 'multiBarChart',
                                                                 height: 256,
                                                                 width: 1050,
                                                                 margin: { left: 50,
                                                                           top: 20,
                                                                           bottom: 100,
                                                                           right: 20 },
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
                       $scope.multibarhorizontalchart_options = angular.copy( $scope.multibarchart_options );
                       $scope.multibarhorizontalchart_options.chart.type = 'multiBarHorizontalChart';
                       $scope.multibarhorizontalchart_options.chart.height = 512;
                       $scope.multibarhorizontalchart_options.chart.margin = { left: 250,
                                                                               top: 20,
                                                                               bottom: 20,
                                                                               right: 50 };

                       $scope.chart_options = function( type, data ) {
                           switch( type ) {
                           case 'structure_id':
                           case 'profil_id':
                               $scope.multibarhorizontalchart_options.chart.height = 24 * data.length * data[0].values.length + 40;
                               $scope.multibarhorizontalchart_options.chart.margin.left = _.chain(data[0].values).pluck('x').map( function(label) { return label.length; } ).max().value() * 8;
                               return $scope.multibarhorizontalchart_options;
                           default:
                               return $scope.multibarchart_options;
                           }
                       };

                       $scope.retrieve_data = function( from ) {
                           var started_at = moment();

                           $scope.fin = $scope.debut.clone().endOf( $scope.period_types.selected );

                           $scope.labels = {};
                           $scope.labels.week_day = angular.copy($locale.DATETIME_FORMATS.DAY);
                           $scope.labels.week_day.push( $scope.labels.week_day.shift() );

                           Annuaire.get_profils({}).then( function( response ) {
                               $scope.labels.profil_id = _.chain(response.data).map( function( profil ) { return [ profil.id, profil.name ]; } ).object().value();
                           } );

                           Annuaire.get_applications({}).then( function( response ) {
                               $scope.labels.application_id = _.chain(response.data).map( function( app ) { return [ app.id, app.name ]; } ).object().value();
                           } );


                           Annuaire.get_structures({}).then( function( response ) {
                               $scope.labels.structure_id = _.chain(response.data).map( function( etab ) { return [ etab.id, etab.name ]; } ).object().value();

                               Annuaire.get_stats( { 'timestamp>': $scope.debut.clone().toDate(),
                                                     'timestamp<': $scope.fin.clone().toDate(),
                                                     "structure_id[]": _.chain($scope.labels.structure_id)
                                                     .keys()
                                                     .reject( function( structure_id ) {
                                                         var ignored_structure_id = _([ '0699990Z', '069BACAS', '069DANEZ' ]);
                                                         return ignored_structure_id.contains( structure_id );
                                                     } )
                                                     .value()
                                                   } )
                                   .then( function ( response ) {
                                       var keys = [ 'structure_id', 'application_id', 'profil_id', 'week_day' ];

                                       var stats_to_nvd3_data = function( key, values ) {
                                           var data = [ { key: key,
                                                          values: _.chain(values).keys().map( function( subkey ) {
                                                              return { key: key,
                                                                       value: subkey,
                                                                       x: $scope.labels[ key ][ subkey ],
                                                                       y: values[ subkey ] };
                                                          } )
                                                          .sortBy( function( record ) {
                                                              switch( key ) {
                                                              case 'structure_id':
                                                              case 'profil_id':
                                                                  return record.y * -1;
                                                                  break;
                                                              case 'week_day':
                                                                  return true;
                                                                  break;
                                                              default:
                                                                  return record.x;
                                                              }
                                                          } )
                                                          .value() } ];
                                           console.log( ( ( moment() - started_at ) / 1000.0 ) + 's : extracted ' + key )

                                           return data;
                                       };

                                       var extract_stats = function( logs, keys ) {
                                           return _.chain(keys)
                                               .map( function( key ) {
                                                   return [ key, stats_to_nvd3_data( key, _(logs).countBy( key ) ) ];
                                               } )
                                               .object()
                                               .value();
                                       };

                                       $scope.logs = response.data;
                                       $scope.filters = {};

                                       $scope.stats = {};
                                       $scope.stats.global = extract_stats( $scope.logs, keys );

                                       keys.forEach( function( key ) {
                                           if ( key !== 'week_day' ) {
                                               $scope.stats[ key ] = _.chain($scope.stats.global[ key ][0].values)
                                                   .pluck( 'value' )
                                                   .map( function( value ) {
                                                       return [ value, extract_stats( _($scope.logs).select( function( logline ) { return logline[ key ] === value; } ),
                                                                                      _(keys).difference( [ key ] ) ) ];
                                                   } )
                                                   .object()
                                                   .value();
                                           }
                                       } );

                                       $scope.stats.global.structure_id.push( { key: 'utilisateurs uniques',
                                                                                values: _.chain($scope.logs)
                                                                                .groupBy( function( line ) { return line.structure_id; } )
                                                                                .map( function( loglines, structure_id ) {
                                                                                    return { key: 'utilisateurs uniques',
                                                                                             x: $scope.labels.structure_id[ structure_id ],
                                                                                             y: _.chain(loglines).pluck('user_id').uniq().value().length };
                                                                                } ).value()
                                                                              } );
                                       $scope.stats.global.structure_id.push( { key: 'apps',
                                                                                values: _.chain($scope.logs)
                                                                                .groupBy( function( line ) { return line.structure_id; } )
                                                                                .map( function( loglines, structure_id ) {
                                                                                    return { key: 'apps',
                                                                                             x: $scope.labels.structure_id[structure_id],
                                                                                             y: _.chain(loglines).pluck('application_id').uniq().value().length };
                                                                                } ).value()
                                                                              } );
                                       $scope.stats.global.profil_id.push( { key: 'utilisateurs uniques',
                                                                             values: _.chain($scope.logs)
                                                                             .groupBy( function( line ) { return line.profil_id; } )
                                                                             .map( function( loglines, profil_id ) {
                                                                                 return { key: 'utilisateurs uniques',
                                                                                          x: $scope.labels.profil_id[profil_id],
                                                                                          y: _.chain(loglines).pluck('user_id').uniq().value().length };
                                                                             } ).value()
                                                                           } );

                                       _($scope.stats.structure_id).each( function( etab, structure_id ) {
                                           etab.profil_id.push( { key: 'utilisateurs uniques',
                                                                  values: _.chain($scope.logs)
                                                                  .where({ structure_id: structure_id })
                                                                  .groupBy( function( line ) { return line.profil_id; } )
                                                                  .map( function( loglines, profil_id ) {
                                                                      return { key: 'utilisateurs uniques',
                                                                               x: $scope.labels.profil_id[ profil_id ],
                                                                               y: _.chain(loglines).pluck('user_id').uniq().value().length };
                                                                  } ).value()
                                                                } );
                                       } );

                                       console.log( ( ( moment() - started_at ) / 1000.0 ) + 's : all data received and treated' )
                                   } );
                           } );
                       };

                       $scope.decr_period = function() {
                           $scope.debut.subtract( 1, $scope.period_types.selected + 's' );
                           $scope.retrieve_data( $scope.debut );
                       };
                       $scope.incr_period = function() {
                           $scope.debut.add( 1, $scope.period_types.selected + 's' );
                           $scope.retrieve_data( $scope.debut );
                       };
                       $scope.reset_period = function() {
                           $scope.debut = moment().startOf( $scope.period_types.selected );
                           $scope.retrieve_data( $scope.debut );
                       };

                       $scope.reset_period();
                   }
                 ] );
