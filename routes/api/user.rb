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
            if uv['has_profil']
              uv['profil_actif']['etablissement_logo'] = Laclasse::CrossApp::Sender.send_request_signed( :service_annuaire_v2_etablissements, uv['profil_actif']['etablissement_code_uai'].to_s, 'expand' => 'true' )['logo']
              uv['profil_actif']['etablissement_logo'] = "#{URL_ENT}#{URL_ENT.split('').last == '/' ? '' : '/'}api/logos/#{uv['profil_actif']['etablissement_logo']}" unless uv['profil_actif']['etablissement_logo'].nil?
            end

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

            Laclasse::CrossApp::Sender.put_request_signed(:service_annuaire_user, user[:uid].to_s, params )

            init_current_user( user[:uid] )

            json user_verbose
          end

          app.post "#{APP_PATH}/api/user/avatar/?" do
            content_type :json

            new_filename = "#{user[:uid]}.#{params[:image][:type].split('/').last}"
            FileUtils.mv( params[:image][:tempfile], new_filename )
            begin
              File.open( new_filename ) do |file|
                Laclasse::CrossApp::Sender.post_raw_request_signed( :service_annuaire_user, "#{user[:uid]}/upload/avatar",
                                                                    {},
                                                                    image: file )
              end
            ensure
              File.delete( new_filename )
            end
            init_current_user( user[:uid] )

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
        end
      end
    end
  end
end
