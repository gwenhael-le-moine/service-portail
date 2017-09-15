'use strict';
angular.module( 'portailApp' )
  .run( [ '$templateCache',
    function( $templateCache ) {
      $templateCache.put( 'views/aside_CCNUM_archives.html',
                          `<div class="laius">
    <h2>{{parent.description}}</h2>
    <br>
    <p>
        Au fil des années, des projets pédagogiques, des résidences d'artistes, de scientifiques, et d'écrivains se sont déroulés dans tout le département du rhône, et parfois au delà, amenant plusieurs classes de différents établissements à travailler ensemble autour de l'outil numérique.
    </p>
    <p>
        Retrouver et revisitez les travaux des classes sur ces projets, ici.
    </p>
    <p>
        <a href="https://www.laclasse.com/portail/inscription_CCN_2016/index.html">Description détaillée des Classes Culturelles Numériques de cette année</a>
    </p>
    <p>
        <a href="https://www.laclasse.com/portail/inscription_CCN/index.html">Découvrez les Classes Culturelles Numériques de l'année prochaine.</a>
    </p>
</div>
` );     } ] );