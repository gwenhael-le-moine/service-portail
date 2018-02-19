all: public/app/js/app.min.js public/app/js/stats_app.min.js public/app/css/portail.min.css

# find public/app/ts -type f -exec echo -n {}\  \;
public/app/js/app.js: public/app/ts/resources/ressources_numeriques.ts public/app/ts/resources/tiles.ts public/app/ts/resources/flux.ts public/app/ts/resources/user.ts public/app/ts/defaults.ts public/app/ts/services/utils.ts public/app/ts/services/log.ts public/app/ts/services/popups.ts public/app/ts/services/annuaire.ts public/app/ts/services/current_user.ts public/app/ts/services/CCN.ts public/app/ts/app.ts public/app/ts/components/help_icon.ts public/app/ts/components/portail.ts public/app/ts/components/logo.ts public/app/ts/components/user_tile.ts public/app/ts/components/app-wrapper.ts public/app/ts/components/user_profile.ts public/app/ts/components/app_iframe.ts public/app/ts/components/news.ts public/app/ts/components/avatar.ts public/app/ts/components/profil_actif.ts public/app/tsconfig.json
	-./public/app/node_modules/.bin/tsc --project ./public/app/tsconfig.json

public/app/js/app.min.js: public/app/js/app.js
	-./public/app/node_modules/.bin/google-closure-compiler-js $^ > $@

public/app/css/portail.min.css: public/app/css/main.scss
	-./public/app/node_modules/.bin/lessc $^ $@

public/app/js/stats_app.js: public/app/ts/stats_app.ts public/app/tsconfig_stats.json
	-./public/app/node_modules/.bin/tsc --project ./public/app/tsconfig_stats.json

public/app/js/stats_app.min.js: public/app/js/stats_app.js
	./public/app/node_modules/.bin/google-closure-compiler-js $^ > $@

pull-deps:
	-bundle install --path .bundle
	-cd public/app; npm install

clean:
	-rm public/app/js/app.min.js public/app/js/app.js public/app/css/portail.min.css

clean-all: clean
	-rm -fr .bundle/ruby/
	-rm -fr public/app/node_modules
