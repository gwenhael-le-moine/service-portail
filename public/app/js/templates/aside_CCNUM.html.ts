'use strict';
angular.module( 'portailApp' )
  .run( [ '$templateCache',
    function( $templateCache ) {
      $templateCache.put( 'views/aside_CCNUM.html',
                          `<div class="laius">
    <h2>{{parent.description}}</h2>
    <br>
    <p>
        Des collégiens qui jouent sur le web et sur scène avec des auteurs de théâtre et des écrivains, qui découvrent que design et développement durable peuvent s'allier contre le gaspillage alimentaire, qui cartographient leur territoire grâce à la Big Data en compagnie d'un philosophe, ou encore qui réalisent une enquête-expo sur la grande guerre avec les archives du Rhône, tout cela ce sont les Classes Culturelles Numériques de laclasse.com. 50 classes, du cm2 à la 3ème engagées dans 5 projets collaboratifs et innovants sur l'ENT, à suivre en ligne toute l'année, et lors des rencontres finales.
    </p>
    <p>
        En partenariat avec <a href="http://www.ia69.ac-lyon.fr/" target="_blank">l'Inspection Académique</a> et la DANE de <a href="http://www.ac-lyon.fr/" target="_blank">l'Académie de Lyon</a>.
    </p>
    <p>
        <a href="https://www.laclasse.com/portail/inscription_CCN_2016/index.html">Description détaillée des Classes Culturelles Numériques de cette année</a>
    </p>
    <p>
        <a href="https://www.laclasse.com/portail/inscription_CCN/index.html">Découvrez les Classes Culturelles Numériques de l'année prochaine.</a>
    </p>
    <p>
        Inscriptions en mai : <a href="mailto:info@laclasse.com">info@laclasse.com</a>
    </p>
</div>
` );     } ] );