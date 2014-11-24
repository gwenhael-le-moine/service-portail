'use strict';
angular.module( 'portailApp' )
  .run( [ '$templateCache',
    function( $templateCache ) {
      $templateCache.put( 'views/index.html',
                          '<div class="row portail" data-ng-if="current_user.is_logged">    <div class="col-xs-12 col-sm-12 col-md-4 col-lg-4 aside">	<div class="col-xs-2 col-sm-1 col-md-6 col-lg-6 logolaclasse gris4">	    <a href="{{prefix}}/">		<img data-ng-src="{{prefix}}/app/vendor/charte-graphique-laclasse-com/images/logolaclasse.svg" />		<h3>laclasse.com</h3>	    </a>	</div>	<div class="col-xs-10 col-sm-11 col-md-6 col-lg-6 user" data-ng-style="{ \'background-image\': \'url(\' + avatar + \')\' }">	    <span class="user-info">		<a data-ui-sref="portail.user">		    <h3 data-ng-cloak>{{current_user.prenom}} {{current_user.nom}}</h3>		</a>		<br>		<select class="gris4"			data-ng-controller="ProfilActifCtrl"			data-ng-model="current_user.profil_actif"			data-ng-change="reload()"			data-ng-options="profil as profil.etablissement + \' : \' + profil.nom group by profil.etablissement for profil in current_user.profils track by profil.index" >		</select>		<br>		<a class="logout" href="/logout" title="Déconnexion de Laclasse.com">se déconnecter</a>	    </span>	    <span class="connect-register" data-ng-if="!current_user.is_logged">		<a href="{{prefix}}/login" title="Connexion avec Laclasse.com">se connecter</a>		<!-- <a href="{{prefix}}/register" title="Création de compte avec Laclasse.com">s\'inscrire</a> -->	    </span>	</div>	<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 news">	    <carousel>		<slide ng-repeat="slide in newsfeed" active="slide.active">		    <img class="news-image"			 data-ng-src="{{slide.image ? slide.image: prefix + \'/app/vendor/charte-graphique-laclasse-com/images/logolaclasse.svg\'}}" />		    <div class="carousel-caption">			<span class="pub-date" data-ng-cloak>{{ slide.pubDate }}</span>			<a href="{{ news.link }}" target="_blank"><h6 data-ng-cloak>{{ slide.title }}</h6></a>			<p data-ng-bind-html="slide.trusted_description"></p>		    </div>		</slide>	    </carousel>	</div>    </div>    <div class="col-xs-12 col-sm-12 col-md-8 col-lg-8">	<!-- Page des apps / connecté -->	<div data-ui-view="main"></div>    </div></div><div class="row portail"  data-ng-if="!current_user.is_logged">    <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 page_publique">	<!-- Page publique -->	<div class="row">	    <img class="logo filtered-bg" data-ng-src="{{prefix}}/app/vendor/charte-graphique-laclasse-com/images/logolaclasse.svg" alt="Logo ENT" />	    <a data-ui-sref="app-wrapper({ app: \'aide\' })" title="Trouver de l\'aide...">		<img class="aide" data-ng-src="{{prefix}}/app/vendor/charte-graphique-laclasse-com/images/12_aide.svg" alt="image Aide" />	    </a>	</div>	<div class="row title filtered-fg">	    <span class="nomENT">laclasse.com</span><br />	    <span class="descENT">Espace Num&eacute;rique de Travail<br />		des coll&egrave;ges et &eacute;coles du Rh&ocirc;ne</span>	</div>	<div class="row connexion">	    <span class="bienvenue">Bienvenue !</span><br />	    <a href="{{prefix}}/login" class="btn btn-sm btn-info" title="Connexion à l\'ENT">		se connecter	    </a>	    <div class="annonce">		<p data-ng-cloak>{{annonce}}</p>	    </div>	</div>	<div class="row footer filtered-fg">	    <a href="http://www.rhone.fr/" target="_blank">		<img class="rhone" data-ng-src="{{prefix}}/app/vendor/charte-graphique-laclasse-com/images/logo-rhone-blanc.svg" alt="Logo Département du Rhône" />	    </a>	    <a href="http://www.ac-lyon.fr/" target="_blank">		<img class="acad" data-ng-src="{{prefix}}/app/vendor/charte-graphique-laclasse-com/images/logo-academie-blanc.png" alt="Logo Académie de Lyon" />	    </a>	</div>    </div></div>' );     } ] );