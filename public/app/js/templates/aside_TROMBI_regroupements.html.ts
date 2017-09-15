'use strict';
angular.module( 'portailApp' )
  .run( [ '$templateCache',
    function( $templateCache ) {
      $templateCache.put( 'views/aside_TROMBI_regroupements.html',
                          `<div class="laius">
    <h2>{{parent.description}}</h2>
    <br>
    <div class="blanc form-horizontal"
         style="height: auto;">
        <div class="col-md-12 form-group">
            <label for="text"
                   class="col-md-3 control-label">Filtre :</label>
            <div class="col-md-8">
                <input id="text"
                       class="form-control gris1"
                       ng:model="filter_criteria.text" />
            </div>
        </div>

        <div class="col-md-12 form-group">
            <checkbox id="showclasses"
                      class="form-control checkbox"
                      ng:model="filter_criteria.show_classes"></checkbox>
            <label for="showclasses"
                   class="col-md-3 control-label">Classes </label>
        </div>
        <div class="col-md-12 form-group">
            <checkbox id="showgroupesdeleves"
                      class="form-control checkbox"
                      ng:model="filter_criteria.show_groupes_eleves"></checkbox>
            <label for="showgroupesdeleves"
                   class="col-md-3 control-label">Groupes d'élèves </label>
        </div>
        <div class="col-md-12 form-group">
            <checkbox id="showgroupeslibres"
                      class="form-control checkbox"
                      ng:model="filter_criteria.show_groupes_libres"></checkbox>
            <label for="showgroupeslibres"
                   class="col-md-3 control-label">Groupes libres </label>
        </div>
    </div>
</div>
` );     } ] );