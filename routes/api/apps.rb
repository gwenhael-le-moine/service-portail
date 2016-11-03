# -*- coding: utf-8 -*-

module Portail
  module Routes
    module Api
      module Apps
        def self.registered( app )
          #
          # Service liste des applications
          #
          app.get "#{APP_PATH}/api/apps/default/?" do
            content_type :json

            Laclasse::CrossApp::Sender
              .send_request_signed( :service_annuaire_portail_entree, '/applications', {} )
              .map do |appli|
              next if %w(ANNUAIRE ANN_ENT PORTAIL SSO STARTBOX).include?( appli['id'] )

              default = config[:apps][:default][ appli['id'].to_sym ]

              appli.merge!( default ) unless default.nil?

              appli[ 'application_id' ] = appli[ 'id' ]
              appli.delete( 'id' )
              appli[ 'type' ] = 'INTERNAL'

              appli
            end.compact.to_json
          end

          app.get "#{APP_PATH}/api/apps/?" do
            content_type :json

            is_it_summer_yet = !config.key?( :closed_for_summer ) || config[:closed_for_summer] ? 6 < Time.now.month && Time.now.month < 9 : false

            sleep 0.1 # FIXME, race condition

            return [] if user[:user_detailed]['profil_actif'].nil?

            apps = Laclasse::CrossApp::Sender.send_request_signed( :service_annuaire_portail_entree, "/etablissement/#{user[:user_detailed]['profil_actif']['etablissement_code_uai']}", {} )

            apps = provision_default_apps( user[:user_detailed]['profil_actif']['etablissement_code_uai'] ) if apps.empty?

            apps.each do |application|
              default = config[:apps][:default][ application['application_id'].to_sym ] unless application['application_id'].nil?

              application[ 'hidden' ] = []
              unless default.nil?
                application[ 'icon' ] = default[ :icon ] if application[ 'icon' ].nil?
                application[ 'color' ] = default[ :color ] if application[ 'color' ].nil?
                application[ 'index' ] = default[ :index ] if application[ 'index' ] == -1
                application[ 'hidden' ] = default[ :hidden ] unless default[ :hidden ].nil?
              end
              application[ 'hidden' ] += %w(ELV TUT) if application['type'] == 'INTERNAL' && ( default.nil? || ( !default[:summer] && is_it_summer_yet ) )
            end

            # fixing eventual duplicates
            indexes = apps.map { |a| a['index'] }.sort
            duplicates = indexes.select { |e| indexes.count( e ) > 1 }.uniq
            free_indexes = (0..15).to_a - indexes

            duplicates.each do |i|
              next if free_indexes.empty?

              dup_app = apps.reverse.find { |a| a['index'] == i }
              dup_app['index'] = free_indexes.pop

              dup_app = Hash[ dup_app.map { |k, v| [k.to_sym, v] } ] # all keys to symbols

              dup_app.delete( 'splat' ) # WTF
              dup_app.delete( 'captures' ) # WTF
              Laclasse::CrossApp::Sender.put_request_signed( :service_annuaire_portail_entree, "/#{dup_app[:id]}", dup_app )
            end

            json apps
          end

          app.get "#{APP_PATH}/api/apps/:id" do
            content_type :json
            param :id, Integer, required: true

            json Laclasse::CrossApp::Sender.send_request_signed( :service_annuaire_portail_entree, "/#{params[:id]}", {} )
          end

          app.post "#{APP_PATH}/api/apps/?" do
            content_type :json
            param :index, Integer, required: true
            param :type, String, required: true, in: %w(INTERNAL EXTERNAL)

            param :active, TrueClass, required: false
            param :application_id, String, required: false
            param :color, String, required: false
            param :description, String, required: false
            param :icon, String, required: false
            param :libelle, String, required: false
            param :url, String, required: false

            params.delete('splat')
            params.delete('captures')

            params['etab_code_uai'] = user[:user_detailed]['profil_actif']['etablissement_code_uai']
            json Laclasse::CrossApp::Sender.post_request_signed( :service_annuaire_portail_entree, '', {}, params )
          end

          app.put "#{APP_PATH}/api/apps/:id" do
            content_type :json
            param :id, Integer, required: true

            param :active, TrueClass, required: false
            param :color, String, required: false
            param :description, String, required: false
            param :icon, String, required: false
            param :index, Integer, required: false
            param :libelle, String, required: false
            param :url, String, required: false

            params.delete('splat')
            params.delete('captures')

            json Laclasse::CrossApp::Sender.put_request_signed( :service_annuaire_portail_entree, "/#{params[:id]}", params )
          end

          app.delete "#{APP_PATH}/api/apps/:id" do
            content_type :json
            param :id, Integer, required: true

            params.delete('splat')
            params.delete('captures')

            json Laclasse::CrossApp::Sender.delete_request_signed( :service_annuaire_portail_entree, "/#{params[:id]}", {} )
          end
        end
      end
    end
  end
end
