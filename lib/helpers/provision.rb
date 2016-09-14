# -*- encoding: utf-8 -*-

module Portail
  module Helpers
    module Provision
      attr_accessor :apps

      def provision_default_apps( uai )
        apps = AnnuaireWrapper::Apps.query_defaults
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

        apps.each { |appli| AnnuaireWrapper::Etablissement::Apps.create( uai, appli ) }

        apps
      end
    end
  end
end
