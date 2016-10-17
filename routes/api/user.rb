# -*- coding: utf-8 -*-

module Portail
  module Routes
    module Api
      module User
        def self.registered( app )
          #
          # Gestion de session côtế client
          #
          app.get "#{APP_PATH}/api/user" do
            content_type :json
            param :force_refresh, Sinatra::Param::Boolean, required: false

            return { user: '',
                     info: {},
                     is_logged: false }.to_json unless logged?

            init_current_user( user[:uid] ) if params.key?( :force_refresh ) && params[:force_refresh]

            uv = user_verbose
            uv['profil_actif']['etablissement_logo'] = Laclasse::CrossApp::Sender.send_request_signed( :service_annuaire_v2_etablissements, uv['profil_actif']['etablissement_code_uai'].to_s, 'expand' => 'true' )['logo']
            uv['profil_actif']['etablissement_logo'] = "#{URL_ENT}#{URL_ENT.split('').last == '/' ? '' : '/'}api/logos/#{uv['profil_actif']['etablissement_logo']}" unless uv['profil_actif']['etablissement_logo'].nil?

            uv.to_json
          end

          app.put "#{APP_PATH}/api/user" do
            content_type :json
            param :nom,            String,  required: false
            param :prenom,         String,  required: false
            param :sexe,           String,  required: false, in: %w(F M)
            param :date_naissance, Date,    required: false
            param :adresse,        String,  required: false
            param :code_postal,    Integer, required: false, within: 0..999_999
            param :ville,          String,  required: false
            param :password,       String,  required: false
            # param :login,          String,  required: false
            # param :bloque,         TrueClass, required: false

            Laclasse::CrossApp::Sender.put_request_signed(:service_annuaire_user, user[:uid].to_s, normalize( params ) )

            init_current_user( user[:uid] )

            json user_verbose
          end

          app.post "#{APP_PATH}/api/user/avatar/?" do
            content_type :json

            if params[:image]
              new_filename = "#{user[:uid]}.#{params[:image][:type].split('/').last}"
              FileUtils.mv( params[:image][:tempfile], new_filename )

              Laclasse::CrossApp::Sender.post_raw_request_signed( :service_annuaire_user, "#{user[:uid]}/upload/avatar",
                                                                  {},
                                                                  image: File.open( new_filename ) )

              File.delete( new_filename )

              init_current_user( user[:uid] )
            end

            json user_verbose
          end

          app.delete "#{APP_PATH}/api/user/avatar/?" do
            content_type :json

            Laclasse::CrossApp::Sender.delete_request_signed( :service_annuaire_user, "#{user[:uid]}/avatar", {} )

            init_current_user( user[:uid] )

            json user_verbose
          end

          app.put "#{APP_PATH}/api/user/profil_actif/?" do
            content_type :json
            param :profil_id, String, required: true
            param :uai, String, required: true

            Laclasse::CrossApp::Sender.put_request_signed( :service_annuaire_user,
                                                           "#{user[:uid]}/profil_actif",
                                                           uai: params[:uai],
                                                           profil_id: params[:profil_id] )

            init_current_user( user[:uid] )

            json user_verbose
          end

          #
          # Classes et groupes de l'utilisateur
          #
          app.get "#{APP_PATH}/api/user/regroupements/?" do
            content_type :json

            regroupements = Laclasse::CrossApp::Sender.send_request_signed( :service_annuaire_user, "#{user[:uid]}/regroupements", 'expand' => 'true' )
            regroupements = [ regroupements[ 'classes' ],
                              regroupements[ 'groupes_eleves' ] ]
                              .flatten
                              .reject do |regroupement|
              regroupement[ 'etablissement_code' ] != user[:user_detailed]['profil_actif']['etablissement_code_uai']
            end
                              .each do |regroupement|
              regroupement[ 'id' ] =  regroupement.key?( 'classe_id' ) ? regroupement['classe_id'] : regroupement['groupe_id']
              regroupement[ 'libelle' ] = regroupement.key?( 'classe_libelle' ) ? regroupement['classe_libelle'] : regroupement['groupe_libelle']
              regroupement[ 'type' ] = regroupement.key?( 'classe_id' ) ? 'classe' : 'groupe_eleve'
            end
                              .uniq { |regroupement| regroupement['id'] }
                              .sort_by { |regroupement| regroupement['libelle'].to_s }
                              .reverse
                              .map do |regroupement|
              { libelle: regroupement['libelle'],
                id: regroupement['id'],
                etablissement_nom: regroupement['etablissement_nom'],
                type: regroupement['type'] }
            end

            json regroupements
          end

          #
          # Élèves des Classes et groupes de l'utilisateur
          #
          app.get "#{APP_PATH}/api/user/regroupements/:id/eleves" do
            content_type :json

            eleves = Laclasse::CrossApp::Sender
                       .send_request_signed( :service_annuaire_regroupement, params[:id].to_s, 'expand' => 'true' )['eleves']
                       .map do |eleve|
              eleve[ 'avatar' ] = "#{ANNUAIRE[:url]}/avatar/#{eleve[ 'avatar' ]}"

              eleve
            end

            json eleves
          end

          #
          # Ressources numériques de l'utilisateur
          #
          app.get "#{APP_PATH}/api/user/ressources_numeriques/?" do
            content_type :json

            ressources = Laclasse::CrossApp::Sender
                           .send_request_signed( :service_annuaire_user, "#{user[:uid]}/ressources", 'expand' => 'true' )
                           .reject do |ressource|
              ressource[ 'etablissement_code_uai' ] != user[:user_detailed]['profil_actif']['etablissement_code_uai'] ||
                Date.parse( ressource['date_deb_abon'] ) >= Date.today ||
                Date.parse( ressource['date_fin_abon'] ) <= Date.today
            end
                           .map do |ressource|
              { nom: ressource['lib'],
                description: ressource['nom_court'],
                url: ressource['url_access_get'],
                icon: case ressource['type_ressource']
                      when 'MANUEL'
                        '05_validationcompetences.svg'
                      when 'AUTRE'
                        '07_blogs.svg'
                      else
                        '08_ressources.svg'
                end }
            end

            json ressources
          end

          #
          # Lien d'aide contextuels
          #
          app.get "#{APP_PATH}/api/user/help-links/?" do
            content_type :json

            return [] if user[:user_detailed]['profil_actif'].nil?

            links = config[:help_links].select do |link|
              link[:profils].include?( user[:user_detailed]['profil_actif']['profil_id'] )
            end

            json links
          end
        end
      end
    end
  end
end
