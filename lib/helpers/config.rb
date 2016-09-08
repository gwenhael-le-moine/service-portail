# -*- encoding: utf-8 -*-

module Portail
  module Helpers
    module Config
      attr_accessor :config

      def config
        @config = JSON.parse( File.read( './config/portail.json' ), symbolize_names: true ) if @config.nil?

        @config
      end
    end
  end
end
