# -*- encoding: utf-8 -*-

module Portail
  module Helpers
    module Provision
      attr_accessor :apps

      def provision_default_apps( uai )
        apps = Laclasse::CrossApp::Sender
                 .send_request_signed( :service_annuaire_portail_entree, '/applications', {} )
                 .map do |appli|
          default = config[:apps][:default][ appli['id'].to_sym ]
          next if default.nil?
          next unless default[:default]

          appli.merge!( default )

          appli[ 'application_id' ] = appli[ 'id' ]
          appli.delete( 'id' )
          appli[ 'type' ] = 'INTERNAL'

          Hash[ appli.map { |k, v| [k.to_sym, v] } ] # all keys to symbols
        end.compact

        apps.each do |appli|
          appli[ 'etab_code_uai' ] = uai
          Laclasse::CrossApp::Sender.post_request_signed( :service_annuaire_portail_entree, '', {}, appli )
        end

        apps
      end
    end
  end
end
