'use strict';
angular.module( 'portailApp' )
  .run( [ '$templateCache',
    function( $templateCache ) {
      $templateCache.put( 'views/index.html',
                          '<div class="row portail">    <div class="col-xs-12 col-sm-12 col-md-4 col-lg-4 aside">	<div class="col-xs-1 col-sm-1 col-md-6 col-lg-6 logolaclasse gris4">	    <a data-ng-click="go_home()">		<img data-ng-src="{{prefix}}/app/vendor/charte-graphique-laclasse-com/images/logolaclasse.svg" />		<h3 class="hidden-xs hidden-sm">laclasse.com</h3>	    </a>	</div>	<div class="col-xs-11 col-sm-11 col-md-6 col-lg-6 user"	     data-ng-style="{ \'background-image\': \'url(\' + current_user.avatar + \')\' }">	    <span class="user-info">		<a data-ui-sref="portail.user">		    <h3 class="hidden-xs hidden-sm full-name">{{current_user.prenom}} {{current_user.nom}}</h3>		    <h3 class="hidden-md hidden-lg initiales">{{current_user.prenom[0]}}{{current_user.nom[0]}}</h3>		</a>		<select class="gris4"			data-ng-controller="ProfilActifCtrl"			data-ng-model="current_user.profil_actif"			data-ng-change="reload()"			data-ng-options="profil as profil.etablissement + \' : \' + profil.nom group by profil.etablissement for profil in current_user.profils track by profil.index" >		</select>		<a class="btn hidden-xs hidden-sm logout" href="/logout" title="Déconnexion de Laclasse.com">se déconnecter</a>	    </span>	    <span class="connect-register" data-ng-if="!current_user.is_logged">		<a href="{{prefix}}/login" title="Connexion avec Laclasse.com">se connecter</a>	    </span>	</div>	<ul class="col-xs-12 col-sm-12 col-md-12 col-lg-12 hidden-xs hidden-sm news"	    rn-carousel	    rn-carousel-controls	    rn-carousel-index="news_index">	    <li ng-repeat="slide in newsfeed" active="slide.active">		<img class="news-image"		     data-ng-src="{{slide.image ? slide.image: prefix + \'/app/vendor/charte-graphique-laclasse-com/images/logolaclasse.svg\'}}" />		<div class="carousel-caption">		    <span class="pub-date" data-ng-cloak>{{ slide.pubDate }}</span>		    <a href="{{ slide.link }}" target="_blank"><h6 data-ng-cloak>{{ slide.title }}</h6></a>		    <p data-ng-bind-html="slide.trusted_description"></p>		</div>	    </li>	    <span class="hidden-xs hidden-sm bouton-config-news blanc"		  data-ng-if="current_user.profil_actif.admin"		  data-ng-click="config_news_fluxes()"></span>	</ul>	<div class="hidden-xs hidden-sm angular-carousel-indicators"	     rn-carousel-indicators	     data-ng-if="newsfeed.length > 1"	     slides="newsfeed"	     rn-carousel-index="news_index"></div>    </div>    <div class="col-xs-12 col-sm-12 col-md-8 col-lg-8">	<div data-ui-view="main"></div>    </div></div>' );     } ] );